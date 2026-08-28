/**
 * Render Worker client — main thread interface for OffscreenCanvas rendering
 * 
 * Detects OffscreenCanvas support and falls back to synchronous rendering
 * on the main thread if not available (older browsers).
 */

import { applyWatermarkToContext, getLocale } from './watermark-renderer.js';

let worker = null;
let useWorker = false;

/**
 * Initialize the render worker if OffscreenCanvas is supported
 */
export function initRenderWorker() {
  if (typeof OffscreenCanvas !== 'undefined' && typeof Worker !== 'undefined') {
    try {
      worker = new Worker(new URL('./render.worker.js', import.meta.url), {
        type: 'module',
      });
      useWorker = true;
      console.log('✅ Render worker initialized (OffscreenCanvas supported)');
    } catch (err) {
      console.warn('⚠️ Render worker init failed, falling back to main thread:', err);
      useWorker = false;
    }
  } else {
    console.info('ℹ️ OffscreenCanvas not supported, using main thread rendering');
    useWorker = false;
  }
}

/**
 * Render an image with watermark via worker (or fallback)
 * @param {ImageBitmap} bitmap - source image
 * @param {number} width
 * @param {number} height
 * @param {Object} options - watermark options
 * @param {string} locale - BCP 47 locale
 * @returns {Promise<{bitmap: ImageBitmap, width: number, height: number}>}
 */
export function renderImageWithWatermark(bitmap, width, height, options, locale) {
  if (useWorker && worker) {
    return new Promise((resolve, reject) => {
      const handler = (e) => {
        if (e.data.type === 'rendered') {
          worker.removeEventListener('message', handler);
          resolve(e.data);
        } else if (e.data.type === 'error') {
          worker.removeEventListener('message', handler);
          reject(new Error(e.data.error));
        }
      };
      worker.addEventListener('message', handler);
      worker.postMessage(
        { type: 'render-image', bitmap, width, height, options, locale },
        [bitmap],
      );
    });
  }

  // Fallback: render on main thread
  return renderImageMainThread(bitmap, width, height, options, locale);
}

/**
 * Apply watermark to a pre-rendered bitmap (for PDF pages)
 * @param {ImageBitmap} bitmap
 * @param {number} width
 * @param {height} height
 * @param {Object} options
 * @param {string} locale
 * @returns {Promise<{bitmap: ImageBitmap, width: number, height: number}>}
 */
export function applyWatermarkToBitmap(bitmap, width, height, options, locale) {
  if (useWorker && worker) {
    return new Promise((resolve, reject) => {
      const handler = (e) => {
        if (e.data.type === 'watermarked') {
          worker.removeEventListener('message', handler);
          resolve(e.data);
        } else if (e.data.type === 'error') {
          worker.removeEventListener('message', handler);
          reject(new Error(e.data.error));
        }
      };
      worker.addEventListener('message', handler);
      worker.postMessage(
        { type: 'apply-watermark', bitmap, width, height, options, locale },
        [bitmap],
      );
    });
  }

  // Fallback: render on main thread
  return renderImageMainThread(bitmap, width, height, options, locale);
}

/**
 * Main thread fallback rendering
 * @param {ImageBitmap} bitmap
 * @param {number} width
 * @param {number} height
 * @param {Object} options
 * @param {string} locale
 * @returns {Promise<{bitmap: ImageBitmap, width: number, height: number}>}
 */
async function renderImageMainThread(bitmap, width, height, options, locale) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(bitmap, 0, 0, width, height);
  applyWatermarkToContext(ctx, width, height, options, locale);

  // Return a canvas-based result (no OffscreenCanvas.transferToImageBitmap)
  return { bitmap: canvas, width, height };
}

/**
 * Check if worker rendering is active
 * @returns {boolean}
 */
export function isUsingWorker() {
  return useWorker;
}

/**
 * Terminate the worker (for cleanup)
 */
export function terminateRenderWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
    useWorker = false;
  }
}
