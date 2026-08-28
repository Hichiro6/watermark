/**
 * Core watermark rendering engine
 * Pure canvas operations — no DOM dependencies outside of canvas elements
 * This module is testable in Vitest without jsdom and portable to a Web Worker
 */

/**
 * Locale mapping from app language codes to BCP 47 locale strings
 */
const LOCALE_MAP = {
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  pt: 'pt-PT',
  nl: 'nl-NL',
  it: 'it-IT',
};

/**
 * Get locale string for a given language code
 * @param {string} lang
 * @returns {string}
 */
export function getLocale(lang) {
  return LOCALE_MAP[lang] || 'en-US';
}

/**
 * Resolve template variables in watermark text
 * @param {string} text
 * @param {string} locale
 * @returns {string}
 */
export function resolveTemplateVariables(text, locale) {
  const todayStr = new Date().toLocaleDateString(locale);
  return text
    .replace(/{date}/g, todayStr)
    .replace(/{destinataire}/g, '')
    .replace(/{usage}/g, '');
}

/**
 * Compute font size from options, clamped to safe bounds
 * @param {number} width
 * @param {number} height
 * @param {number} fontSizePercent
 * @returns {{ finalFontSize: number, baseDim: number }}
 */
export function computeFontSize(width, height, fontSizePercent) {
  const baseDim = Math.min(width, height);
  const scaleFactor = fontSizePercent / 100;
  const fontSize = baseDim * scaleFactor;

  const minFontSize = Math.max(24, baseDim * 0.02);
  const maxFontSize = Math.min(baseDim * 0.15, 600);

  const finalFontSize = Math.max(minFontSize, Math.min(fontSize, maxFontSize));

  return { finalFontSize, baseDim };
}

/**
 * Apply watermark to a CanvasRenderingContext2D
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 * @param {Object} opts - { text, fontSize, color, opacity, position, rotation }
 * @param {string} locale - BCP 47 locale string (ex: 'fr-FR')
 */
export function applyWatermarkToContext(ctx, width, height, opts, locale) {
  const text = resolveTemplateVariables(opts.text, locale);
  const { finalFontSize, baseDim } = computeFontSize(width, height, opts.fontSize);

  ctx.font = `bold ${finalFontSize}px sans-serif`;
  ctx.fillStyle = opts.color;
  ctx.globalAlpha = opts.opacity / 100;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = text.split('\n');
  const lineHeight = finalFontSize * 1.3;

  switch (opts.position) {
    case 'diagonal':
      renderDiagonal(ctx, width, height, lines, lineHeight, opts.rotation);
      break;
    case 'center':
      renderCenter(ctx, width, height, lines, lineHeight);
      break;
    case 'bottom':
      renderBottom(ctx, width, height, lines, lineHeight, baseDim);
      break;
    case 'tile':
      renderTile(ctx, width, height, lines, finalFontSize, baseDim, opts.rotation);
      break;
    default:
      renderDiagonal(ctx, width, height, lines, lineHeight, opts.rotation);
  }
}

/**
 * Render diagonal watermark (rotated, centered)
 */
function renderDiagonal(ctx, width, height, lines, lineHeight, rotation) {
  ctx.save();
  ctx.translate(width / 2, height / 2);
  const rot = rotation || -45;
  ctx.rotate((rot * Math.PI) / 180);

  const startY = (-(lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, 0, startY + i * lineHeight);
  });

  ctx.restore();
}

/**
 * Render centered watermark (no rotation)
 */
function renderCenter(ctx, width, height, lines, lineHeight) {
  ctx.save();
  ctx.translate(width / 2, height / 2);

  const startY = (-(lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, 0, startY + i * lineHeight);
  });

  ctx.restore();
}

/**
 * Render bottom watermark
 */
function renderBottom(ctx, width, height, lines, lineHeight, baseDim) {
  const y = height - Math.max(100, baseDim * 0.05);
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, y + i * lineHeight);
  });
}

/**
 * Render tiled watermark (repeated pattern)
 */
function renderTile(ctx, width, height, lines, finalFontSize, baseDim, rotation) {
  const tileSize = Math.min(width, height) / 4;
  const fontSizeTile = finalFontSize / 2;

  ctx.font = `bold ${fontSizeTile}px sans-serif`;

  for (let x = tileSize / 2; x < width; x += tileSize) {
    for (let y = tileSize / 2; y < height; y += tileSize) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(((rotation || -45) * Math.PI) / 180);

      const tileLH = fontSizeTile * 1.3;
      const startY = (-(lines.length - 1) * tileLH) / 2;
      lines.forEach((line, i) => {
        ctx.fillText(line, 0, startY + i * tileLH);
      });

      ctx.restore();
    }
  }
}

/**
 * Export a canvas as a downloadable file
 * @param {HTMLCanvasElement} canvas
 * @param {string} filename
 * @param {string} type - MIME type (default: image/png)
 * @param {number} quality - for JPEG (0-1)
 */
export function exportCanvas(canvas, filename, type = 'image/png', quality = 0.92) {
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    type,
    quality,
  );
}
