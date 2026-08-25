import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

/**
 * Traite un fichier PDF et ajoute un filigrane texte
 * @param {File} file - Le fichier PDF à traiter
 * @param {Object} options - Options du filigrane
 * @returns {Promise<Blob>} - Le PDF modifié en tant que Blob
 */
export async function watermakPdf(file, options) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  // Embed standard font
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Préparer le texte avec la date sélectionnée
  let text = options.text;
  let dateStr;
  if (options.dateMode === 'custom' && options.customDate) {
    const d = new Date(options.customDate + 'T00:00:00');
    dateStr = d.toLocaleDateString('fr-FR');
  } else {
    dateStr = new Date().toLocaleDateString('fr-FR');
  }
  text = text.replace('{date}', dateStr);
  text = text.replace('{destinataire}', options.destinataire || '');
  text = text.replace('{usage}', options.usage || '');

  // Split en lignes (pdf-lib ne gère pas \n)
  const lines = text.split('\n');

  // Convertir couleur hex vers rgb (0-1)
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  };

  const [r, g, b] = hexToRgb(options.color);
  const alpha = options.opacity / 100;
  const watermarkColor = rgb(r * alpha, g * alpha, b * alpha);

  // pdf-lib utilise la même convention rotationnelle que Canvas
  // (sens horaire pour les angles positifs). Pas d'inversion nécessaire.
  const pdfRotation = options.rotation ?? -45;

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const fontSize = Math.min(options.fontSize, Math.min(width, height) / 10);
    const lineHeight = fontSize * 1.3;

    // Helper: dessiner un bloc de texte multi-lignes centré avec rotation
    const drawTextBlock = (cx, cy, angle, fntSz) => {
      const fs = fntSz || fontSize;
      const lh = fs * 1.3;
      const totalHeight = (lines.length - 1) * lh;
      lines.forEach((line, i) => {
        const textWidth = font.widthOfTextAtSize(line, fs);
        page.drawText(line, {
          x: cx - textWidth / 2,
          y: cy - totalHeight / 2 + i * lh,
          size: fs,
          font,
          color: watermarkColor,
          rotate: degrees(angle),
        });
      });
    };

    if (options.position === 'diagonal') {
      drawTextBlock(width / 2, height / 2, pdfRotation);
    } else if (options.position === 'center') {
      // Centre, sans rotation (horizontal)
      drawTextBlock(width / 2, height / 2, 0);
    } else if (options.position === 'bottom') {
      // Bas de page, sans rotation
      const smallFont = fontSize * 0.7;
      lines.forEach((line, i) => {
        const textWidth = font.widthOfTextAtSize(line, smallFont);
        page.drawText(line, {
          x: (width - textWidth) / 2,
          y: 40 + (lines.length - 1 - i) * (smallFont * 1.3),
          size: smallFont,
          font,
          color: watermarkColor,
        });
      });
    } else if (options.position === 'tile') {
      const tileSize = Math.min(width, height) / 3;
      const fontSizeTile = tileSize / 10;
      for (let x = tileSize / 2; x < width; x += tileSize) {
        for (let y = tileSize / 2; y < height; y += tileSize) {
          drawTextBlock(x, y, pdfRotation, fontSizeTile);
        }
      }
    }
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
