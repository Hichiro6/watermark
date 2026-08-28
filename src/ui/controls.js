/**
 * Controls UI component
 * Handles watermark text, sliders, color picker, position selector, presets
 */

import { getLocale } from '../core/watermark-renderer.js';
import { getCurrentLanguage, getPresetText } from '../i18n.js';
import { PRESETS } from '../presets.js';
import { state, updateOptions } from '../state.js';
import { debouncedPreview } from './preview.js';

/** @type {Record<string, HTMLElement>} */
const elements = {};

/**
 * Initialize all controls
 */
export function initControls() {
  cacheElements();
  bindControlEvents();
  bindCollapsibleSections();
}

/**
 * Cache DOM elements for performance
 */
function cacheElements() {
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
 * Bind event listeners to all controls
 */
function bindControlEvents() {
  // Watermark text input
  if (elements.watermarkText) {
    elements.watermarkText.addEventListener('input', (e) => {
      updateOptions({ text: e.target.value });
      debouncedPreview();
    });
  }

  // Opacity slider
  if (elements.opacitySlider) {
    elements.opacitySlider.addEventListener('input', (e) => {
      updateOptions({ opacity: parseInt(e.target.value, 10) });
      if (elements.opacityValue) elements.opacityValue.textContent = `${e.target.value}%`;
      debouncedPreview();
    });
  }

  // Font size slider
  if (elements.fontSizeSlider) {
    elements.fontSizeSlider.addEventListener('input', (e) => {
      updateOptions({ fontSize: parseInt(e.target.value, 10) });
      if (elements.fontSizeValue) elements.fontSizeValue.textContent = `${e.target.value}%`;
      debouncedPreview();
    });
  }

  // Rotation slider
  if (elements.rotationSlider) {
    elements.rotationSlider.addEventListener('input', (e) => {
      updateOptions({ rotation: parseInt(e.target.value, 10) });
      if (elements.rotationValue) elements.rotationValue.textContent = `${e.target.value}°`;
      debouncedPreview();
    });
  }

  // Color picker buttons
  if (elements.colorPicker) {
    elements.colorPicker.querySelectorAll('.color-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        elements.colorPicker.querySelectorAll('.color-btn').forEach((b) => {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        updateOptions({ color: btn.dataset.color });
        debouncedPreview();
      });
    });
  }

  // Position segmented control
  if (elements.positionControl) {
    elements.positionControl.querySelectorAll('.seg-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        elements.positionControl.querySelectorAll('.seg-btn').forEach((b) => {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        updateOptions({ position: btn.dataset.position });
        debouncedPreview();
      });
    });
  }

  // Preset buttons
  bindPresetButtons();

  // Language change: re-render presets + watermark text
  document.addEventListener('languagechange', handleLanguageChange);
}

/**
 * Render preset buttons in the grid
 */
export function renderPresets() {
  if (!elements.presetsGrid) return;
  const lang = getCurrentLanguage();
  elements.presetsGrid.innerHTML = PRESETS.map(
    (preset) => `
    <button class="preset-btn" data-preset="${preset.id}">
      <span class="preset-btn__icon">${preset.icon}</span>
      <span class="preset-btn__label">${preset.label?.[lang] || preset.label?.en || preset.label || preset.id}</span>
      <span class="preset-btn__hint">${preset.hint?.[lang] || preset.hint?.en || preset.hint || ''}</span>
    </button>
  `,
  ).join('');
  bindPresetButtons();
}

/**
 * Bind click events to preset buttons
 */
function bindPresetButtons() {
  if (!elements.presetsGrid) return;
  elements.presetsGrid.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      elements.presetsGrid.querySelectorAll('.preset-btn').forEach((b) => {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      const preset = PRESETS.find((p) => p.id === btn.dataset.preset);
      if (preset) {
        const localizedText = getPresetText(preset.id);
        const locale = getLocale(getCurrentLanguage());
        const todayStr = new Date().toLocaleDateString(locale);
        const textWithDate = localizedText.replace(/{date}/g, todayStr);

        if (elements.watermarkText) elements.watermarkText.value = textWithDate;
        updateOptions({ text: textWithDate });
        debouncedPreview();
      }
    });
  });
}

/**
 * Handle language change event
 */
function handleLanguageChange() {
  renderPresets();

  // Update watermark text if a preset is active
  const activePreset = elements.presetsGrid?.querySelector('.preset-btn.active');
  if (activePreset) {
    const preset = PRESETS.find((p) => p.id === activePreset.dataset.preset);
    if (preset) {
      const localizedText = getPresetText(preset.id);
      const locale = getLocale(getCurrentLanguage());
      const todayStr = new Date().toLocaleDateString(locale);
      const textWithDate = localizedText.replace(/{date}/g, todayStr);

      if (elements.watermarkText) elements.watermarkText.value = textWithDate;
      updateOptions({ text: textWithDate });
    }
  }

  // Re-render preview with new locale
  if (state.file) debouncedPreview();
}

/**
 * Bind collapsible section toggles
 */
function bindCollapsibleSections() {
  document.querySelectorAll('.control-group__title').forEach((title) => {
    const toggleSection = () => {
      const body = title.parentElement?.querySelector('.control-group__body');
      if (!body) return;
      const expanded = title.getAttribute('aria-expanded') === 'true';
      title.setAttribute('aria-expanded', String(!expanded));
      body.classList.toggle('collapsed');
    };

    title.addEventListener('click', toggleSection);
    title.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleSection();
      }
    });
  });
}

/**
 * Set initial default watermark text from first preset
 */
export function setDefaultWatermarkText() {
  const defaultPreset = PRESETS[0];
  if (!defaultPreset || !elements.watermarkText) return;

  const localizedText = getPresetText(defaultPreset.id);
  if (!localizedText) return;

  const locale = getLocale(getCurrentLanguage());
  const todayStr = new Date().toLocaleDateString(locale);
  const textWithDate = localizedText.replace(/{date}/g, todayStr);

  elements.watermarkText.value = textWithDate;
  updateOptions({ text: textWithDate });
}

/**
 * Get cached elements (for external access)
 * @returns {typeof elements}
 */
export function getElements() {
  return elements;
}
