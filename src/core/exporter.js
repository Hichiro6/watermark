/**
 * Export module — handles file download for images and PDFs
 * Uses pdf-lib for PDF export (JPEG embedding for efficiency),
 * canvas.toBlob for images
 */

import { state } from '../state.js';
import { exportCanvas } from '../core/watermark-renderer.js';
import { t } from '../i18n.js';

/**
 * Handle download of watermarked file
 */
export async function handleDownload() {
  if (!state.file) return;

  if (state.file.type === 'application/pdf' && state.previewCanvases.length === 0) return;
  if (state.file.type !== 'application/pdf' && !state.previewCanvas) return;

  try {
    let blob;

    if (state.file.type === 'application/pdf') {
      blob = await canvasesToPdf(state.previewCanvases);
    } else {
      blob = await new Promise((resolve) => {
        state.previewCanvas.toBlob(resolve, state.file.type || 'image/png');
      });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ext = state.file.type === 'application/pdf' ? 'pdf' : 'png';
    const baseName = state.file.name.replace(/\.[^.]+$/, '');
    a.href = url;
    a.download = `${baseName}_watermarked.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    alert(t('alerts.downloadError', { error: error.message }));
  }
}

/**
 * Convert canvas array to PDF (faithful copy of preview)
 * Uses JPEG embedding at 0.95 quality for smaller file sizes
 * @param {HTMLCanvasElement[]} canvases
 * @returns {Promise<Blob>}
 */
async function canvasesToPdf(canvases) {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();

  for (const canvas of canvases) {
    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const jpegBase64 = jpegDataUrl.split(',')[1];
    const jpegBytes = Uint8Array.from(atob(jpegBase64), (c) => c.charCodeAt(0));

    const image = await pdfDoc.embedJpg(jpegBytes);
    const width = image.width;
    const height = image.height;

    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Register download button event
 */
export function initExport() {
  const btnDownload = document.getElementById('btn-download');
  if (btnDownload) {
    btnDownload.addEventListener('click', handleDownload);
  }
}
