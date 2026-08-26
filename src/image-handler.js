/**
 * Traite un fichier image et ajoute un filigrane texte via Canvas
 * @param {File} file - Le fichier image à traiter
 * @param {Object} options - Options du filigrane
 * @returns {Promise<Blob>} - L'image modifiée en tant que Blob
 */
export async function watermarkImage(file, options) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Dimensionner le canvas à l'image originale
      canvas.width = img.width;
      canvas.height = img.height;

      // Dessiner l'image originale
      ctx.drawImage(img, 0, 0);

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

      // Configurer le style
      const fontSize = Math.min(options.fontSize, Math.min(canvas.width, canvas.height) / 10);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = options.color;
      ctx.globalAlpha = options.opacity / 100;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Mesurer le texte pour le centrage
      const metrics = ctx.measureText(text);
      const textWidth = metrics.width;
      const textHeight = fontSize;

      if (options.position === 'diagonal' || options.position === 'center') {
        // Filigrane centré avec rotation
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((options.rotation || -45) * Math.PI / 180);
        
        // Si plusieurs lignes
        const lines = text.split('\n');
        const lineHeight = fontSize * 1.3;
        const startY = -(lines.length - 1) * lineHeight / 2;

        lines.forEach((line, i) => {
          ctx.fillText(line, 0, startY + i * lineHeight);
        });

        ctx.restore();
      } else if (options.position === 'bottom') {
        // Texte en bas
        const lines = text.split('\n');
        const lineHeight = fontSize * 1.3;
        const y = canvas.height - 100;
        
        lines.forEach((line, i) => {
          ctx.fillText(line, canvas.width / 2, y + i * lineHeight);
        });
      } else if (options.position === 'tile') {
        // Mosaïque répétée
        const tileSize = Math.min(canvas.width, canvas.height) / 4;
        const fontSizeTile = fontSize / 2;
        
        ctx.font = `bold ${fontSizeTile}px sans-serif`;
        
        for (let x = tileSize / 2; x < canvas.width; x += tileSize) {
          for (let y = tileSize / 2; y < canvas.height; y += tileSize) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((options.rotation || -45) * Math.PI / 180);
            
            const lines = text.split('\n');
            const lineHeight = fontSizeTile * 1.3;
            const startY = -(lines.length - 1) * lineHeight / 2;
            
            lines.forEach((line, i) => {
              ctx.fillText(line, 0, startY + i * lineHeight);
            });
            
            ctx.restore();
          }
        }
      }

      // Exporter l'image
      canvas.toBlob((blob) => {
        resolve(blob);
      }, file.type || 'image/png');
    };

    img.onerror = () => {
      reject(new Error('Erreur lors du chargement de l\'image'));
    };

    reader.readAsDataURL(file);
  });
}
