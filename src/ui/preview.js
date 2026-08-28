/**
 * Preview component — handles image/PDF rendering and watermark application
 * Delegates core rendering to core/watermark-renderer.js
 * Uses render-worker-client for OffscreenCanvas acceleration
 */

import * as pdfjsLib from 'pdfjs-dist';
import {
  applyWatermarkToBitmap,
  initRenderWorker,
  renderImageWithWatermark,
} from '../core/render-worker-client.js';
import { getLocale } from '../core/watermark-renderer.js';
import { getCurrentLanguage, t } from '../i18n.js';
import { state } from '../state.js';

let isPreviewing = false;
let previewToken = 0;

/**
 * Initialize PDF.js worker and render worker
 */
export function initPdfWorker() {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    '/pdf.worker.min.mjs',
    import.meta.url
  ).href;
  initRenderWorker();
}

/**
 * Debounced preview function
 * @param {number} delay
 * @returns {void}
 */
let debounceTimer = null;
export function debouncedPreview(delay = 200) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    renderPreview();
  }, delay);
}

/**
 * Main preview rendering function
 */
export async function renderPreview() {
  if (!state.file || isPreviewing) return;
  isPreviewing = true;
  const currentToken = ++previewToken;

  const previewArea = document.getElementById('preview-area');
  if (!previewArea) return;

  // Only show spinner on first render (no existing canvas to keep visible)
  if (!previewArea.querySelector('canvas')) {
    previewArea.innerHTML = '<div class="spinner"></div>';
  }

  try {
    if (state.file.type === 'application/pdf') {
      await renderPdfPreview();
    } else {
      await renderImagePreview();
    }
  } catch (error) {
    console.error('Render error:', error);
    previewArea.innerHTML = '';
    const errEl = document.createElement('p');
    errEl.className = 'error';
    errEl.textContent = `❌ Error: ${error.message}`;
    previewArea.appendChild(errEl);
  } finally {
    isPreviewing = false;
  }

  // If a newer preview was requested during render, re-render
  if (currentToken !== previewToken) {
    renderPreview();
  }
}

/**
 * Render PDF preview with watermarks on each page
 */
async function renderPdfPreview() {
  const previewArea = document.getElementById('preview-area');
  if (!previewArea) return;

  try {
    // Reuse cached PDF document to avoid re-fetching/re-parsing on every slider change
    if (!state.pdfDocument) {
      if (!state.fileBlob) {
        state.fileBlob = new Blob([await state.file.arrayBuffer()], { type: state.file.type });
      }
      const arrayBuffer = await state.fileBlob.arrayBuffer();
      state.pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer, isEvalSupported: false }).promise;
    }
    const pdf = state.pdfDocument;

    const containerWidth = previewArea.clientWidth || 600;
    const totalPages = pdf.numPages;

    // Clear previous PDF canvases only (keep spinner if present)
    previewArea.innerHTML = '';
    state.previewCanvases = [];

    const locale = getLocale(getCurrentLanguage());

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport0 = page.getViewport({ scale: 1 });
      const scale = Math.min(1, containerWidth / viewport0.width);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;

      // Apply watermark via OffscreenCanvas (if supported)
      const bitmap = await createImageBitmap(canvas);
      const { bitmap: resultBitmap } = await applyWatermarkToBitmap(
        bitmap,
        canvas.width,
        canvas.height,
        state.options,
        locale,
      );

      // Draw result back to main canvas
      if (resultBitmap instanceof ImageBitmap) {
        const finalCtx = canvas.getContext('2d');
        finalCtx.drawImage(resultBitmap, 0, 0);
        bitmap.close();
        if (typeof resultBitmap.close === 'function') resultBitmap.close();
      }

      // Page indicator
      const pageInfo = document.createElement('div');
      pageInfo.style.cssText = `
        text-align: center;
        padding: 8px 0;
        color: var(--text-tertiary);
        font-size: 0.9rem;
        flex-shrink: 0;
      `;
      pageInfo.textContent = t('page.indicator', { num: pageNum, total: totalPages });
      previewArea.appendChild(pageInfo);
      previewArea.appendChild(canvas);

      state.previewCanvases.push(canvas);

      if (pageNum % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
  } catch (error) {
    console.error('PDF preview error:', error);
    previewArea.innerHTML = '';
    const errEl = document.createElement('p');
    errEl.className = 'error';
    errEl.textContent = `❌ PDF Error: ${error.message}`;
    previewArea.appendChild(errEl);
  }
}

/**
 * Render image preview with watermark
 */
async function renderImagePreview() {
  const previewArea = document.getElementById('preview-area');
  if (!previewArea) return;

  const img = new Image();
  img.src = state.fileUrl;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  // Create ImageBitmap for efficient transfer to worker
  const bitmap = await createImageBitmap(img);
  const width = bitmap.width;
  const height = bitmap.height;

  const locale = getLocale(getCurrentLanguage());
  const { bitmap: resultBitmap } = await renderImageWithWatermark(
    bitmap,
    width,
    height,
    state.options,
    locale,
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (resultBitmap instanceof ImageBitmap) {
    ctx.drawImage(resultBitmap, 0, 0);
    if (typeof resultBitmap.close === 'function') resultBitmap.close();
  } else {
    // Fallback: resultBitmap is already a canvas
    ctx.drawImage(resultBitmap, 0, 0);
  }

  // Replace old canvas smoothly (keep old visible until new one is ready)
  const oldCanvas = previewArea.querySelector('canvas');
  canvas.style.display = 'block';
  if (oldCanvas) {
    oldCanvas.replaceWith(canvas);
  } else {
    previewArea.innerHTML = '';
    previewArea.appendChild(canvas);
  }
  state.previewCanvas = canvas;

  bitmap.close();
}
