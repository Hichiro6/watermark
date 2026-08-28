/**
 * Render Worker — OffscreenCanvas watermark rendering
 * 
 * Receives image data + watermark options, renders on OffscreenCanvas,
 * and transfers back the result. Keeps the main thread free for UI.
 * 
 * Supported messages:
 * - { type: 'render-image', bitmap, width, height, options, locale }
 *   → returns { type: 'rendered', bitmap, width, height }
 * - { type: 'apply-watermark', bitmap, width, height, options, locale }
 *   → returns { type: 'watermarked', bitmap, width, height }
 */

import { applyWatermarkToContext, getLocale } from './watermark-renderer.js';

self.onmessage = async (e) => {
  const { type } = e.data;

  switch (type) {
    case 'render-image':
      await handleRenderImage(e.data);
      break;
    case 'apply-watermark':
      await handleApplyWatermark(e.data);
      break;
    default:
      console.warn('[Worker] Unknown message type:', type);
  }
};

/**
 * Render an image with watermark applied
 * @param {Object} data - { bitmap, width, height, options, locale }
 */
async function handleRenderImage({ bitmap, width, height, options, locale }) {
  try {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Draw the image
    ctx.drawImage(bitmap, 0, 0, width, height);

    // Apply watermark
    applyWatermarkToContext(ctx, width, height, options, locale);

    // Transfer back as ImageBitmap
    const resultBitmap = canvas.transferToImageBitmap();

    self.postMessage(
      { type: 'rendered', bitmap: resultBitmap, width, height },
      [resultBitmap],
    );
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
}

/**
 * Apply watermark to an already-rendered bitmap (for PDF pages)
 * @param {Object} data - { bitmap, width, height, options, locale }
 */
async function handleApplyWatermark({ bitmap, width, height, options, locale }) {
  try {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Draw the existing rendered page
    ctx.drawImage(bitmap, 0, 0, width, height);

    // Apply watermark on top
    applyWatermarkToContext(ctx, width, height, options, locale);

    // Transfer back
    const resultBitmap = canvas.transferToImageBitmap();

    self.postMessage(
      { type: 'watermarked', bitmap: resultBitmap, width, height },
      [resultBitmap],
    );
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
}
