/**
 * WaterMark — Application Bootstrap
 * 
 * Entry point only — delegates to focused modules:
 * - state.js       : centralized state management
 * - ui/dropzone.js : file drag-and-drop + selection
 * - ui/controls.js : watermark text, sliders, colors, presets
 * - ui/preview.js  : canvas rendering (images + PDF)
 * - core/          : watermark renderer + exporter (no DOM deps)
 */

import '../styles/main.css';
import { initI18n } from './i18n.js';
import { initPdfWorker, debouncedPreview } from './ui/preview.js';
import { initDropzone, resetDropzone } from './ui/dropzone.js';
import { initControls, renderPresets, setDefaultWatermarkText } from './ui/controls.js';
import { initExport } from './core/exporter.js';

/**
 * Application initialization
 */
async function init() {
  // i18n first — all UI text must be translated before rendering
  initI18n();

  // Initialize PDF.js worker
  initPdfWorker();

  // Initialize UI components
  initControls();
  initDropzone();
  initExport();

  // Set default watermark text from first preset
  setDefaultWatermarkText();

  // Render initial presets
  renderPresets();

  // Bind reset button
  const btnReset = document.getElementById('btn-reset');
  if (btnReset) {
    btnReset.addEventListener('click', resetApp);
  }

  // Register service worker for PWA
  registerServiceWorker();

  console.log('✅ WaterMark initialized');
}

/**
 * Reset application to initial state
 */
function resetApp() {
  resetDropzone();
  const fileInput = document.getElementById('file-input');
  if (fileInput) fileInput.value = '';
}

/**
 * Register service worker for PWA offline support
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => console.log('✅ Service Worker registered'))
      .catch((err) => console.warn('⚠️ SW registration failed:', err));
  }
}

// Start the app
init();
