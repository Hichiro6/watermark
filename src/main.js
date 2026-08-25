import '../styles/main.css';
import { PRESETS } from './presets.js';
import { watermakImage } from './image-handler.js';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { initI18n, setLanguage, t, getPresetText, getCurrentLanguage } from './i18n.js';

// État de l'application
const state = {
  file: null,
  fileUrl: null,
  fileBlob: null,        // cached Blob for PDF re-renders (reliable, can be read multiple times)
  previewCanvas: null,   // pour images (téléchargement image)
  previewCanvases: [],    // pour PDF (tous les canvases rendus)
  options: {
    text: 'Copie pour vérification uniquement\n{date}',
    position: 'diagonal',
    opacity: 30,
    fontSize: 48,
    color: '#dc2626',
    rotation: -45,
  },
};

// Éléments DOM
const elements = {};

/**
 * Initialisation de l'application
 */
async function init() {
  // Initialize i18n first so all UI text is translated before rendering
  initI18n();
  
  cacheElements();
  renderPresets();
  bindEvents();

  // Sync initial values from inputs to state
  // Set default watermark text in the textarea (using i18n preset for current language)
  const defaultPreset = PRESETS[0];
  if (defaultPreset) {
    const localizedText = getPresetText(defaultPreset.id);
    if (localizedText) {
      // Substitute {date} with today's date automatically
      const localeMap = { en: 'en-US', fr: 'fr-FR', de: 'de-DE', es: 'es-ES', pt: 'pt-PT' };
      const todayStr = new Date().toLocaleDateString(localeMap[getCurrentLanguage()] || 'en-US');
      const textWithDate = localizedText.replace(/{date}/g, todayStr);
      elements.watermarkText.value = textWithDate;
      state.options.text = textWithDate;
    }
  }
  // Set worker path for PDF.js
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

  registerServiceWorker();
  console.log('✅ WaterMark initialized');
}

/**
 * Mise en cache des éléments DOM
 */
function cacheElements() {
  elements.dropzone = document.getElementById('dropzone');
  elements.fileInput = document.getElementById('file-input');
  elements.workspace = document.getElementById('workspace');
  elements.filename = document.getElementById('filename');
  elements.previewArea = document.getElementById('preview-area');
  elements.btnDownload = document.getElementById('btn-download');
  elements.btnReset = document.getElementById('btn-reset');
  
  elements.watermarkText = document.getElementById('watermark-text');
  
  elements.opacitySlider = document.getElementById('opacity');
  elements.opacityValue = document.getElementById('opacity-value');
  elements.fontSizeSlider = document.getElementById('fontsize');
  elements.fontSizeValue = document.getElementById('fontsize-value');
  elements.rotationSlider = document.getElementById('rotation');
  elements.rotationValue = document.getElementById('rotation-value');
  elements.colorPicker = document.getElementById('color-picker');
  elements.positionControl = document.getElementById('position-control');
  elements.presetsGrid = document.getElementById('presets-grid');
}

/**
 * Rendu des boutons de presets
 */
function renderPresets() {
  const lang = getCurrentLanguage();
  elements.presetsGrid.innerHTML = PRESETS.map(preset => `
    <button class="preset-btn" data-preset="${preset.id}">
      <span class="preset-btn__icon">${preset.icon}</span>
      <span class="preset-btn__label">${preset.label?.[lang] || preset.label?.en || preset.label || preset.id}</span>
      <span class="preset-btn__hint">${preset.hint?.[lang] || preset.hint?.en || preset.hint || ''}</span>
    </button>
  `).join('');
}

/**
 * Liaison des événements
 */
function bindEvents() {
  // Dropzone
  elements.dropzone.addEventListener('click', () => elements.fileInput.click());
  elements.dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.dropzone.classList.add('dragover');
  });
  elements.dropzone.addEventListener('dragleave', () => {
    elements.dropzone.classList.remove('dragover');
  });
  elements.dropzone.addEventListener('drop', handleDrop);
  elements.fileInput.addEventListener('change', handleFileSelect);

  // Boutons
  elements.btnDownload.addEventListener('click', handleDownload);
  elements.btnReset.addEventListener('click', resetApp);

  // Inputs texte
  elements.watermarkText.addEventListener('input', (e) => {
    state.options.text = e.target.value;
    debouncedPreview();
  });

  // Sliders
  elements.opacitySlider.addEventListener('input', (e) => {
    state.options.opacity = parseInt(e.target.value);
    elements.opacityValue.textContent = `${e.target.value}%`;
    debouncedPreview();
  });
  elements.fontSizeSlider.addEventListener('input', (e) => {
    state.options.fontSize = parseInt(e.target.value);
    elements.fontSizeValue.textContent = `${e.target.value}px`;
    debouncedPreview();
  });
  elements.rotationSlider.addEventListener('input', (e) => {
    state.options.rotation = parseInt(e.target.value);
    elements.rotationValue.textContent = `${e.target.value}°`;
    debouncedPreview();
  });

  // Sélecteur de couleur
  elements.colorPicker.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      elements.colorPicker.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.options.color = btn.dataset.color;
      debouncedPreview();
    });
  });

  // Contrôles de position
  elements.positionControl.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      elements.positionControl.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.options.position = btn.dataset.position;
      debouncedPreview();
    });
  });

  // Presets
  elements.presetsGrid.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      elements.presetsGrid.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = PRESETS.find(p => p.id === btn.dataset.preset);
      if (preset) {
        const localizedText = getPresetText(preset.id);
        // Substitute {date} with today's date automatically
        const localeMap = { en: 'en-US', fr: 'fr-FR', de: 'de-DE', es: 'es-ES', pt: 'pt-PT' };
        const todayStr = new Date().toLocaleDateString(localeMap[getCurrentLanguage()] || 'en-US');
        const textWithDate = localizedText.replace(/{date}/g, todayStr);
        elements.watermarkText.value = textWithDate;
        state.options.text = textWithDate;
        debouncedPreview();
      }
    });
  });
}

/**
 * Gestion du drop de fichier
 */
function handleDrop(e) {
  e.preventDefault();
  elements.dropzone.classList.remove('dragover');
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    loadFile(files[0]);
  }
}

/**
 * Gestion de la sélection de fichier
 */
function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    loadFile(files[0]);
  }
}

/**
 * Chargement et traitement d'un fichier
 */
async function loadFile(file) {
  const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp', 'image/gif'];
  
  if (!validTypes.includes(file.type)) {
    alert(t('alerts.unsupported'));
    return;
  }

  // Nettoyer l'URL précédente
  if (state.fileUrl) {
    URL.revokeObjectURL(state.fileUrl);
  }

  state.file = file;
  state.fileUrl = URL.createObjectURL(file);
  
  elements.filename.textContent = file.name;
  elements.dropzone.hidden = true;
  elements.workspace.hidden = false;

  await renderPreview();
}

/**
 * Affichage de la prévisualisation
 */
async function renderPreview() {
  elements.previewArea.innerHTML = '<div class="spinner"></div>';

  try {
    if (state.file.type === 'application/pdf') {
      await renderPdfPreview();
    } else {
      await renderImagePreview();
    }
  } catch (error) {
    console.error('Erreur de rendu:', error);
    elements.previewArea.innerHTML = `<p class="error">❌ Erreur: ${error.message}</p>`;
  }
}

/**
 * Prévisualisation PDF via PDF.js
 */
async function renderPdfPreview() {
  try {
    // Cache the file as a Blob — File.arrayBuffer() can only be consumed once
    // in some browsers (especially Playwright's Chromium). Subsequent calls
    // to renderPreview() (e.g. after position/opacity change) would throw
    // NotReadableError or "detached ArrayBuffer" without this cache.
    // Blob.arrayBuffer() can be called repeatedly without issues.
    if (!state.fileBlob) {
      state.fileBlob = new Blob([await state.file.arrayBuffer()], { type: state.file.type });
    }
    const arrayBuffer = await state.fileBlob.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, isEvalSupported: false }).promise;
    
    const containerWidth = elements.previewArea.clientWidth || 600;
    const totalPages = pdf.numPages;
    
    // Créer un canvas pour chaque page, empilés en scroll
    elements.previewArea.innerHTML = '';
    state.previewCanvases = [];
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport0 = page.getViewport({ scale: 1 });
      const scale = Math.min(1, containerWidth / viewport0.width);
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({ canvasContext: ctx, viewport }).promise;
      
      // Appliquer le filigrane sur le canvas rendu
      applyWatermarkToContext(ctx, canvas.width, canvas.height);
      
      // Ajouter un indicateur de page
      const pageInfo = document.createElement('div');
      pageInfo.style.cssText = `
        text-align: center;
        padding: 8px 0;
        color: var(--text-tertiary);
        font-size: 0.9rem;
        flex-shrink: 0;
      `;
      pageInfo.textContent = t('page.indicator', { num: pageNum, total: totalPages });
      elements.previewArea.appendChild(pageInfo);
      elements.previewArea.appendChild(canvas);
      
      // Stocker le canvas pour le téléchargement PDF
      state.previewCanvases.push(canvas);

      // Laisser le navigateur respirer entre les pages (évite le gel sur gros PDF)
      if (pageNum % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
  } catch (error) {
    console.error('PDF preview error:', error);
    elements.previewArea.innerHTML = `<p class="error">❌ Erreur PDF: ${error.message}</p>`;
  }
}

/**
 * Prévisualisation image
 */
async function renderImagePreview() {
  const img = new Image();
  img.src = state.fileUrl;
  
  await new Promise(resolve => {
    img.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  
  ctx.drawImage(img, 0, 0);
  applyWatermarkToContext(ctx, canvas.width, canvas.height);
  
  elements.previewArea.innerHTML = '';
  elements.previewArea.appendChild(canvas);
  state.previewCanvas = canvas;
}

/**
 * Application du filigrane sur un contexte Canvas
 */
function applyWatermarkToContext(ctx, width, height) {
  let text = state.options.text;
  
  // Replace {date} with today's date; remove unused variables
  const localeMap = { en: 'en-US', fr: 'fr-FR', de: 'de-DE', es: 'es-ES', pt: 'pt-PT' };
  const locale = localeMap[getCurrentLanguage()] || 'en-US';
  const todayStr = new Date().toLocaleDateString(locale);
  text = text.replace(/{date}/g, todayStr);
  text = text.replace(/{destinataire}/g, '').replace(/{usage}/g, '');

  const fontSize = Math.min(state.options.fontSize, Math.min(width, height) / 10);
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = state.options.color;
  ctx.globalAlpha = state.options.opacity / 100;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = text.split('\n');
  const lineHeight = fontSize * 1.3;

  if (state.options.position === 'diagonal') {
    ctx.save();
    ctx.translate(width / 2, height / 2);
    // Canvas: y va vers le bas, rotation négative = diagonale montante ↗️
    const rot = state.options.rotation || -45;
    ctx.rotate(rot * Math.PI / 180);
    
    const startY = -(lines.length - 1) * lineHeight / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, 0, startY + i * lineHeight);
    });
    
    ctx.restore();
  } else if (state.options.position === 'center') {
    // Centre, sans rotation (horizontal)
    ctx.save();
    ctx.translate(width / 2, height / 2);
    
    const startY = -(lines.length - 1) * lineHeight / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, 0, startY + i * lineHeight);
    });
    
    ctx.restore();
  } else if (state.options.position === 'bottom') {
    const y = height - 100;
    lines.forEach((line, i) => {
      ctx.fillText(line, width / 2, y + i * lineHeight);
    });
  } else if (state.options.position === 'tile') {
    const tileSize = Math.min(width, height) / 4;
    const fontSizeTile = fontSize / 2;
    
    ctx.font = `bold ${fontSizeTile}px sans-serif`;
    
    for (let x = tileSize / 2; x < width; x += tileSize) {
      for (let y = tileSize / 2; y < height; y += tileSize) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((state.options.rotation || -45) * Math.PI / 180);
        
        const startY = -(lines.length - 1) * (fontSizeTile * 1.3) / 2;
        lines.forEach((line, i) => {
          ctx.fillText(line, 0, startY + i * (fontSizeTile * 1.3));
        });
        
        ctx.restore();
      }
    }
  }
}

/**
 * Téléchargement du document modifié
 */
async function handleDownload() {
  if (!state.file) return;
  // Pour images: previewCanvas est défini. Pour PDF: previewCanvases est rempli.
  if (state.file.type === 'application/pdf' && state.previewCanvases.length === 0) return;
  if (state.file.type !== 'application/pdf' && !state.previewCanvas) return;

  try {
    let blob;
    
    if (state.file.type === 'application/pdf') {
      // Pour PDF, on prend les canvases déjà rendus et on les emballe dans un PDF
      blob = await canvasesToPdf(state.previewCanvases);
    } else {
      // Pour images, on prend le canvas déjà traité
      blob = await new Promise(resolve => {
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
    console.error('Erreur de téléchargement:', error);
    alert(t('alerts.downloadError', { error: error.message }));
  }
}

/**
 * Convertit un tableau de canvases en PDF (copie conforme de la preview)
 */
async function canvasesToPdf(canvases) {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  
  for (const canvas of canvases) {
    // Convertir canvas en JPEG (quality 0.95 pour haute qualité, minime perte)
    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const jpegBase64 = jpegDataUrl.split(',')[1];
    const jpegBytes = Uint8Array.from(atob(jpegBase64), c => c.charCodeAt(0));
    
    // Embed image
    const image = await pdfDoc.embedJpg(jpegBytes);
    const width = image.width;
    const height = image.height;
    
    // Add page de même taille
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
 * Réinitialisation de l'application
 */
function resetApp() {
  if (state.fileUrl) {
    URL.revokeObjectURL(state.fileUrl);
  }
  
  state.file = null;
  state.fileUrl = null;
  state.fileBlob = null;  // Clear cached Blob
  state.previewCanvas = null;
  state.previewCanvases = [];
  
  elements.fileInput.value = '';
  elements.dropzone.hidden = false;
  elements.workspace.hidden = true;
  elements.previewArea.innerHTML = '';
}

/**
 * Debounce pour éviter les recalculs trop fréquents
 */
let debounceTimer;
function debouncedPreview() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    renderPreview();
  }, 300);
}

/**
 * Enregistrement du Service Worker pour PWA
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('✅ Service Worker registered'))
      .catch(err => console.warn('⚠️ SW registration failed:', err));
  }
}

// Démarrage
init();
