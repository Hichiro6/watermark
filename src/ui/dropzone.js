/**
 * Dropzone UI component
 * Handles file drag-and-drop, click, and keyboard accessibility
 */

import { clearFile, setFile } from '../state.js';
import { renderPreview } from './preview.js';

/** @type {HTMLElement | null} */
let dropzone = null;
/** @type {HTMLInputElement | null} */
let fileInput = null;

/**
 * Initialize the dropzone component
 */
export function initDropzone() {
  dropzone = document.getElementById('dropzone');
  fileInput = document.getElementById('file-input');

  if (!dropzone || !fileInput) {
    console.warn('⚠️ Dropzone or fileInput element not found');
    return;
  }

  bindEvents();
}

/**
 * Bind all dropzone event listeners
 */
function bindEvents() {
  // Click to open file dialog
  dropzone.addEventListener('click', () => fileInput?.click());

  // Keyboard accessibility
  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput?.click();
    }
  });

  // Drag & Drop events
  dropzone.addEventListener('dragover', handleDragOver);
  dropzone.addEventListener('dragleave', handleDragLeave);
  dropzone.addEventListener('drop', handleDrop);
  fileInput.addEventListener('change', handleFileSelect);
}

/**
 * Handle dragover event
 */
function handleDragOver(e) {
  e.preventDefault();
  dropzone.classList.add('dragover');
}

/**
 * Handle dragleave event
 */
function handleDragLeave(e) {
  e.preventDefault();
  dropzone.classList.remove('dragover');
}

/**
 * Handle drop event
 */
function handleDrop(e) {
  e.preventDefault();
  dropzone.classList.remove('dragover');

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    loadFile(files[0]);
  }
}

/**
 * Handle file input change
 */
function handleFileSelect(e) {
  const files = e.target.files;
  if (files && files.length > 0) {
    loadFile(files[0]);
  }
}

/**
 * Load and validate a file
 * @param {File} file
 */
async function loadFile(file) {
  const validTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/bmp',
    'image/gif',
  ];

  if (!validTypes.includes(file.type)) {
    alert('Format non pris en charge. Veuillez charger un PDF ou une image.');
    return;
  }

  // Cache the file as a Blob
  const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type });
  const fileUrl = URL.createObjectURL(file);

  setFile(file, fileUrl, fileBlob);

  // Update UI
  updateUIForFileLoaded(file.name);

  // Screen reader announcement
  announceToScreenReader(`Document ${file.name} loaded. Workspace is now visible.`);

  // Render preview
  await renderPreview();
}

/**
 * Update UI when a file is loaded
 * @param {string} filename
 */
export function updateUIForFileLoaded(filename) {
  const filenameEl = document.getElementById('filename');
  const workspace = document.getElementById('workspace');

  if (filenameEl) filenameEl.textContent = filename;
  if (dropzone) dropzone.hidden = true;
  if (workspace) workspace.hidden = false;
}

/**
 * Announce message to screen readers
 * @param {string} message
 */
function announceToScreenReader(message) {
  const srLive = document.getElementById('sr-live');
  if (srLive) srLive.textContent = message;
}

/**
 * Reset dropzone state (called when user resets the app)
 */
export function resetDropzone() {
  clearFile();
  if (dropzone) dropzone.hidden = false;
  const workspace = document.getElementById('workspace');
  if (workspace) workspace.hidden = true;
  const previewArea = document.getElementById('preview-area');
  if (previewArea) previewArea.innerHTML = '';
}

/**
 * Get current dropzone element (for external access if needed)
 * @returns {HTMLElement | null}
 */
export function getDropzone() {
  return dropzone;
}
