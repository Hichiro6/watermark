/**
 * WaterMark PWA - Système de traduction multilingue
 * Langues : EN (principal), FR, DE, ES, PT, NL, IT
 *
 * Les traductions sont chargées dynamiquement (code-splitting par langue)
 * pour réduire la taille du bundle initial.
 *
 * Utilisation :
 *   - Éléments avec data-i18n="key" sont traduits automatiquement
 *   - data-i18n-placeholder pour les placeholders d'inputs
 *   - data-i18n-title pour les titres/labels
 *
 * API :
 *   initI18n()      — Appelée au démarrage, initialise la langue
 *   setLanguage(lg) — Change la langue (ex: 'fr', 'de')
 *   t(key)          — Retourne la traduction d'une clé
 */

export const LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  es: { name: 'Español', flag: '🇪🇸' },
  pt: { name: 'Português', flag: '🇵🇹' },
  nl: { name: 'Nederlands', flag: '🇳🇱' },
  it: { name: 'Italiano', flag: '🇮🇹' },
};

const STORAGE_KEY = 'watermark_lang';
let currentLang = 'en';

// Cache for loaded translations
/** @type {Record<string, { translations: Record<string, string>, presetTexts: Record<string, string> }>} */
const loadedLocales = {};

// Fallback English translations (used before async load completes)
const FALLBACK_TRANSLATIONS = {
  'app.title': 'WaterMark — Secure your documents',
  'header.tagline': 'Security watermark for administrative documents',
  'privacy.badge': '🔒 100% local — your documents never leave your browser',
  'privacy.link': 'View on GitHub',
  'footer.bmc': 'Buy me a coffee',
  'dropzone.title': 'Drop your document here',
  'dropzone.subtitle': 'or click to select a file',
  'controls.presets': 'Quick presets',
  'controls.text': 'Watermark text',
  'controls.appearance': 'Appearance',
  'controls.position': 'Position',
  'controls.opacity': 'Opacity',
  'controls.size': 'Size',
  'controls.color': 'Color',
  'controls.rotation': 'Rotation',
  'btn.download': 'Download',
  'btn.reset': 'New document',
  'alerts.unsupported': 'Unsupported format. Please choose a PDF or image.',
  'alerts.download.error': 'Download error: ',
  'page.indicator': 'Page {num} of {total}',
  'errors.pdf': '❌ PDF error: {msg}',
  'errors.generic': '❌ Error: {msg}',
  'lang.label': 'Language',
};

const FALLBACK_PRESETS = {
  identite: 'Copy for identity verification only\n{date}',
  rib: 'Bank details sent to {destinataire}\nSingle use — {date}',
  domicile: 'Proof of address for {destinataire}\n{date}',
  permis: 'License copy — single use\nSent to {destinataire} on {date}',
  facture: 'Document sent to {destinataire}\n{date}',
  medical: 'Medical document — strictly private\nDo not distribute — {date}',
};

/**
 * Dynamically load a locale file
 * @param {string} lang
 * @returns {Promise<void>}
 */
async function loadLocale(lang) {
  if (loadedLocales[lang]) return;

  try {
    const module = await import(`./locales/${lang}.js`);
    loadedLocales[lang] = {
      translations: module.default,
      presetTexts: module.presetTexts || {},
    };
  } catch (err) {
    console.warn(`⚠️ Failed to load locale '${lang}', using fallback`, err);
    // Populate with fallback so the app doesn't break
    if (lang === 'en') {
      loadedLocales[lang] = {
        translations: FALLBACK_TRANSLATIONS,
        presetTexts: FALLBACK_PRESETS,
      };
    }
  }
}

/**
 * Initialise l'i18n : anglais par défaut, sauf préférence sauvegardée
 */
export async function initI18n() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && LANGUAGES[saved]) {
    currentLang = saved;
  }

  // Load the required locale
  await loadLocale(currentLang);

  // Create the language selector
  createLanguageSelector();

  // Apply translations
  applyTranslations();
}

/**
 * Change the language and update the UI
 * @param {string} lang
 */
export async function setLanguage(lang) {
  if (!LANGUAGES[lang]) return;

  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);

  // Load locale if not already loaded
  await loadLocale(lang);

  // Update active button
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
    btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
  });

  // Apply translations
  applyTranslations();

  // Notify the rest of the app
  document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));

  // Trigger input event to refresh watermark text
  const wmText = document.getElementById('watermark-text');
  if (wmText) wmText.dispatchEvent(new Event('input'));
}

/**
 * Get current language code
 * @returns {string}
 */
export function getCurrentLanguage() {
  return currentLang;
}

/**
 * Get translation for a key
 * @param {string} key
 * @param {Record<string, string|number>} params
 * @returns {string}
 */
export function t(key, params = {}) {
  const locale = loadedLocales[currentLang];
  const dict = locale?.translations || FALLBACK_TRANSLATIONS;
  let text = dict[key] ?? FALLBACK_TRANSLATIONS[key] ?? key;

  for (const [k, v] of Object.entries(params)) {
    text = text.replaceAll(`{${k}}`, String(v));
  }
  return text;
}

/**
 * Get preset text for current language
 * @param {string} id
 * @returns {string}
 */
export function getPresetText(id) {
  const locale = loadedLocales[currentLang];
  return locale?.presetTexts?.[id] ?? FALLBACK_PRESETS[id] ?? '';
}

// ─────────── Helpers privés ───────────

function createLanguageSelector() {
  const header = document.querySelector('.header');
  if (!header || document.getElementById('lang-selector')) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'lang-selector';
  wrapper.className = 'lang-selector';
  wrapper.role = 'group';
  wrapper.setAttribute('aria-label', t('lang.label'));

  for (const [code, info] of Object.entries(LANGUAGES)) {
    const btn = document.createElement('button');
    btn.className = `lang-btn${code === currentLang ? ' active' : ''}`;
    btn.dataset.lang = code;
    btn.type = 'button';
    btn.title = info.name;
    btn.setAttribute('aria-label', info.name);
    btn.setAttribute('aria-pressed', code === currentLang ? 'true' : 'false');
    btn.textContent = info.flag;
    btn.addEventListener('click', () => setLanguage(code));
    wrapper.appendChild(btn);
  }

  header.appendChild(wrapper);
}

function applyTranslations() {
  const locale = loadedLocales[currentLang];
  const dict = locale?.translations || FALLBACK_TRANSLATIONS;

  document.title = dict['app.title'];
  document.documentElement.lang = currentLang;

  const map = [
    ['.header__tagline', 'textContent', 'header.tagline'],
    ['.footer__privacy .badge[data-i18n="privacy.badge"]', 'textContent', 'privacy.badge'],
    ['.footer__links a[data-i18n="privacy.link"]', 'textContent', 'privacy.link'],
    ['.footer__bmc span[data-i18n="footer.bmc"]', 'textContent', 'footer.bmc'],
    ['#dropzone h2', 'textContent', 'dropzone.title'],
    ['#dropzone p', 'textContent', 'dropzone.subtitle'],
    ['#controls-presets > span', 'textContent', 'controls.presets'],
    ['#controls\\.text > span', 'textContent', 'controls.text'],
    ['#watermark-text', 'placeholder', 'controls.text'],
    ['#controls\\.appearance > span', 'textContent', 'controls.appearance'],
  ];

  map.forEach(([sel, prop, key]) => {
    const el = document.querySelector(sel);
    if (el) el[prop] = dict[key];
  });

  const labelMap = {
    'watermark-text': 'controls.text',
    opacity: 'controls.opacity',
    fontsize: 'controls.size',
    rotation: 'controls.rotation',
  };

  Object.entries(labelMap).forEach(([forId, key]) => {
    const label = document.querySelector(`label[for="${forId}"]`);
    if (label) {
      const span = label.querySelector('span[data-i18n]');
      if (span) {
        span.textContent = dict[key];
      } else {
        label.textContent = dict[key];
      }
    }
  });

  const posLabel = document.querySelector('.control-field label[data-i18n="controls.position"]');
  if (posLabel) posLabel.textContent = dict['controls.position'];

  const colorLabel = document.querySelector('.control-field label[data-i18n="controls.color"]');
  if (colorLabel) colorLabel.textContent = dict['controls.color'];

  const dlSpan = document.querySelector('#btn-download span[data-i18n="btn.download"]');
  if (dlSpan) dlSpan.textContent = dict['btn.download'];

  const resetBtn = document.getElementById('btn-reset');
  if (resetBtn) resetBtn.setAttribute('aria-label', dict['btn.reset']);

  const dateLabel = document.querySelector('label[for="date-picker"]');
  if (dateLabel) dateLabel.textContent = dict['controls.date.label'];

  const recLabel = document.querySelector('label[for="destinataire"]');
  if (recLabel) recLabel.textContent = dict['controls.recipient'];

  const usageLabel = document.querySelector('label[for="usage"]');
  if (usageLabel) usageLabel.textContent = dict['controls.usage'];

  document.querySelectorAll('[data-position]').forEach((btn) => {
    const pos = btn.dataset.position;
    const key = `controls.pos.${pos}`;
    btn.textContent = dict[key];
  });
}
