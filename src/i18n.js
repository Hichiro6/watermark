/**
 * WaterMark PWA - Système de traduction multilingue
 * Langues : EN (principal), FR, DE, ES, PT
 *
 * Utilisation :
 *   - Éléments avec data-i18n="key" sont traduits automatiquement
 *   - data-i18n-placeholder pour les placeholders d'inputs
 *   - data-i18n-title pour les titres/labels
 *
 * API :
 *   initI18n()      - Appelée au démarrage, initialise la langue
 *   setLanguage(lg) - Change la langue (ex: 'fr', 'de')
 *   t(key)          - Retourne la traduction d'une clé
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

// Textes des presets par langue (variables {date} et {destinataire} préservées)
export const PRESET_TEXTS = {
  identite: {
    en: 'Copy for identity verification only\n{date}',
    fr: "Copie pour vérification d'identité uniquement\n{date}",
    de: 'Kopie nur zur Identitätsprüfung\n{date}',
    es: 'Copia solo para verificación de identidad\n{date}',
    pt: 'Cópia apenas para verificação de identidade\n{date}',
    nl: 'Kopie alleen voor identiteitsverificatie\n{date}',
    it: 'Copia solo per verifica identità\n{date}',
  },
  rib: {
    en: 'Bank details sent to {destinataire}\nSingle use — {date}',
    fr: 'RIB transmis à {destinataire}\nUsage unique — {date}',
    de: 'Bankverbindung an {destinataire}\nEinmalige Nutzung — {date}',
    es: 'Datos bancarios enviados a {destinataire}\nUso único — {date}',
    pt: 'Dados bancários enviados para {destinataire}\nUso único — {date}',
    nl: 'Bankgegevens verzonden aan {destinataire}\nEenmalig gebruik — {date}',
    it: 'Dati bancari inviati a {destinataire}\nUso singolo — {date}',
  },
  domicile: {
    en: 'Proof of address for {destinataire}\n{date}',
    fr: 'Justificatif de domicile pour {destinataire}\n{date}',
    de: 'Adressnachweis für {destinataire}\n{date}',
    es: 'Justificante de domicilio para {destinataire}\n{date}',
    pt: 'Comprovante de residência para {destinataire}\n{date}',
    nl: 'Bewijs van adres voor {destinataire}\n{date}',
    it: 'Prova di residenza per {destinataire}\n{date}',
  },
  permis: {
    en: 'License copy — single use\nSent to {destinataire} on {date}',
    fr: 'Copie du permis — usage unique\nTransmis à {destinataire} le {date}',
    de: 'Führerscheinkopie — einmalig\nAn {destinataire} am {date}',
    es: 'Copia de licencia — uso único\nEnviada a {destinataire} el {date}',
    pt: 'Cópia da licença — uso único\nEnviada para {destinataire} em {date}',
    nl: 'Rijbewijskopie — eenmalig\nVerzonden aan {destinataire} op {date}',
    it: 'Copia patente — uso singolo\nInviata a {destinataire} il {date}',
  },
  facture: {
    en: 'Document sent to {destinataire}\n{date}',
    fr: 'Document transmis à {destinataire}\n{date}',
    de: 'Dokument an {destinataire}\n{date}',
    es: 'Documento enviado a {destinataire}\n{date}',
    pt: 'Documento enviado para {destinataire}\n{date}',
    nl: 'Document verzonden aan {destinataire}\n{date}',
    it: 'Documento inviato a {destinataire}\n{date}',
  },
  medical: {
    en: 'Medical document — strictly private\nDo not distribute — {date}',
    fr: 'Document médical — usage strictement privé\nNe pas diffuser — {date}',
    de: 'Medizinisches Dokument — streng privat\nNicht verbreiten — {date}',
    es: 'Documento médico — estrictamente privado\nNo distribuir — {date}',
    pt: 'Documento médico — estritamente privado\nNão distribuir — {date}',
    nl: 'Medisch document — strikt privé\nNiet verspreiden — {date}',
    it: 'Documento medico — strettamente privato\nNon distribuire — {date}',
  },
};

export const TRANSLATIONS = {
  en: {
    'app.title': 'WaterMark — Secure your documents',
    'header.tagline': 'Security watermark for administrative documents',
    'privacy.badge': '🔒 100% local — your documents never leave your browser',
    'privacy.link': 'View on GitHub',
    'footer.bmc': 'Buy me a coffee',
    'dropzone.title': 'Drop your document here',
    'dropzone.subtitle': 'or click to select a file',
    'controls.presets': 'Quick presets',
    'controls.text': 'Watermark text',
    'controls.recipient': 'Recipient',
    'controls.recipient.ph': 'e.g. Smith Bank',
    'controls.usage': 'Usage',
    'controls.usage.ph': 'e.g. Identity verification',
    'controls.date.label': 'Document date',
    'controls.date.hint': 'The {date} variable will use this date.',
    'controls.date.today': 'Today',
    'controls.date.custom': 'Custom date',
    'controls.appearance': 'Appearance',
    'controls.position': 'Position',
    'controls.pos.diagonal': 'Diagonal',
    'controls.pos.center': 'Center',
    'controls.pos.bottom': 'Bottom',
    'controls.pos.tile': 'Tile',
    'controls.opacity': 'Opacity',
    'controls.size': 'Size',
    'controls.color': 'Color',
    'controls.rotation': 'Rotation',
    'btn.download': 'Download',
    'btn.reset': 'New document',
    'alerts.unsupported':
      'Unsupported format. Please choose a PDF or image (JPG, PNG, WEBP, BMP, GIF).',
    'alerts.download.error': 'Download error: ',
    'page.indicator': 'Page {num} of {total}',
    'errors.pdf': '❌ PDF error: {msg}',
    'errors.generic': '❌ Error: {msg}',
    'lang.label': 'Language',
  },
  fr: {
    'app.title': 'WaterMark — Sécurisez vos documents',
    'header.tagline': 'Filigrane de sécurité pour documents administratifs',
    'privacy.badge': '🔒 100% local — vos documents ne quittent jamais votre navigateur',
    'privacy.link': 'Voir sur GitHub',
    'footer.bmc': 'Offrir un café',
    'dropzone.title': 'Déposez votre document ici',
    'dropzone.subtitle': 'ou cliquez pour sélectionner un fichier',
    'controls.presets': 'Modèles rapides',
    'controls.text': 'Texte du filigrane',
    'controls.recipient': 'Destinataire',
    'controls.recipient.ph': 'Ex : Banque Dupont',
    'controls.usage': 'Usage',
    'controls.usage.ph': 'Ex : Vérification identité',
    'controls.date.label': 'Date du document',
    'controls.date.hint': 'La variable {date} utilisera cette date.',
    'controls.date.today': "Aujourd'hui",
    'controls.date.custom': 'Date personnalisée',
    'controls.appearance': 'Apparence',
    'controls.position': 'Position',
    'controls.pos.diagonal': 'Diagonale',
    'controls.pos.center': 'Centre',
    'controls.pos.bottom': 'Bas',
    'controls.pos.tile': 'Mosaïque',
    'controls.opacity': 'Opacité',
    'controls.size': 'Taille',
    'controls.color': 'Couleur',
    'controls.rotation': 'Rotation',
    'btn.download': 'Télécharger',
    'btn.reset': 'Nouveau document',
    'alerts.unsupported':
      'Format non pris en charge. Veuillez choisir un PDF ou une image (JPG, PNG, WEBP, BMP, GIF).',
    'alerts.download.error': 'Erreur de téléchargement : ',
    'page.indicator': 'Page {num} de {total}',
    'errors.pdf': '❌ Erreur PDF : {msg}',
    'errors.generic': '❌ Erreur : {msg}',
    'lang.label': 'Langue',
  },
  de: {
    'app.title': 'WaterMark — Sichern Sie Ihre Dokumente',
    'header.tagline': 'Sicherheits-Wasserzeichen für Verwaltungsdokumente',
    'privacy.badge': '🔒 100% lokal — Ihre Dokumente verlassen nie den Browser',
    'privacy.link': 'Auf GitHub ansehen',
    'footer.bmc': 'Kaffee ausgeben',
    'dropzone.title': 'Dokument hier ablegen',
    'dropzone.subtitle': 'oder klicken, um eine Datei auszuwählen',
    'controls.presets': 'Schnellvorlagen',
    'controls.text': 'Wasserzeichen-Text',
    'controls.recipient': 'Empfänger',
    'controls.recipient.ph': 'z.B. Bank Müller',
    'controls.usage': 'Verwendung',
    'controls.usage.ph': 'z.B. Identitätsprüfung',
    'controls.date.label': 'Dokumentdatum',
    'controls.date.hint': 'Die Variable {date} verwendet dieses Datum.',
    'controls.date.today': 'Heute',
    'controls.date.custom': 'Benutzerdefiniertes Datum',
    'controls.appearance': 'Erscheinungsbild',
    'controls.position': 'Position',
    'controls.pos.diagonal': 'Diagonal',
    'controls.pos.center': 'Zentriert',
    'controls.pos.bottom': 'Unten',
    'controls.pos.tile': 'Mosaik',
    'controls.opacity': 'Deckkraft',
    'controls.size': 'Größe',
    'controls.color': 'Farbe',
    'controls.rotation': 'Rotation',
    'btn.download': 'Herunterladen',
    'btn.reset': 'Neues Dokument',
    'alerts.unsupported':
      'Nicht unterstütztes Format. Bitte wählen Sie ein PDF oder Bild (JPG, PNG, WEBP, BMP, GIF).',
    'alerts.download.error': 'Download-Fehler: ',
    'page.indicator': 'Seite {num} von {total}',
    'errors.pdf': '❌ PDF-Fehler: {msg}',
    'errors.generic': '❌ Fehler: {msg}',
    'lang.label': 'Sprache',
  },
  es: {
    'app.title': 'WaterMark — Protege tus documentos',
    'header.tagline': 'Marca de agua de seguridad para documentos administrativos',
    'privacy.badge': '🔒 100% local — tus documentos nunca salen del navegador',
    'privacy.link': 'Ver en GitHub',
    'footer.bmc': 'Invítame un café',
    'dropzone.title': 'Deja tu documento aquí',
    'dropzone.subtitle': 'o haz clic para seleccionar un archivo',
    'controls.presets': 'Plantillas rápidas',
    'controls.text': 'Texto de marca de agua',
    'controls.recipient': 'Destinatario',
    'controls.recipient.ph': 'Ej: Banco García',
    'controls.usage': 'Uso',
    'controls.usage.ph': 'Ej: Verificación de identidad',
    'controls.date.label': 'Fecha del documento',
    'controls.date.hint': 'La variable {date} usará esta fecha.',
    'controls.date.today': 'Hoy',
    'controls.date.custom': 'Fecha personalizada',
    'controls.appearance': 'Apariencia',
    'controls.position': 'Posición',
    'controls.pos.diagonal': 'Diagonal',
    'controls.pos.center': 'Centro',
    'controls.pos.bottom': 'Abajo',
    'controls.pos.tile': 'Mosaico',
    'controls.opacity': 'Opacidad',
    'controls.size': 'Tamaño',
    'controls.color': 'Color',
    'controls.rotation': 'Rotación',
    'btn.download': 'Descargar',
    'btn.reset': 'Nuevo documento',
    'alerts.unsupported':
      'Formato no compatible. Elige un PDF o imagen (JPG, PNG, WEBP, BMP, GIF).',
    'alerts.download.error': 'Error de descarga: ',
    'page.indicator': 'Página {num} de {total}',
    'errors.pdf': '❌ Error de PDF: {msg}',
    'errors.generic': '❌ Error: {msg}',
    'lang.label': 'Idioma',
  },
  pt: {
    'app.title': 'WaterMark — Proteja seus documentos',
    'header.tagline': "Marca d'água de segurança para documentos administrativos",
    'privacy.badge': '🔒 100% local — seus documentos nunca saem do navegador',
    'privacy.link': 'Ver no GitHub',
    'footer.bmc': 'Pague um café',
    'dropzone.title': 'Solte seu documento aqui',
    'dropzone.subtitle': 'ou clique para selecionar um arquivo',
    'controls.presets': 'Modelos rápidos',
    'controls.text': "Texto da marca d'água",
    'controls.recipient': 'Destinatário',
    'controls.recipient.ph': 'Ex: Banco Silva',
    'controls.usage': 'Uso',
    'controls.usage.ph': 'Ex: Verificação de identidade',
    'controls.date.label': 'Data do documento',
    'controls.date.hint': 'A variável {date} usará esta data.',
    'controls.date.today': 'Hoje',
    'controls.date.custom': 'Data personalizada',
    'controls.appearance': 'Aparência',
    'controls.position': 'Posição',
    'controls.pos.diagonal': 'Diagonal',
    'controls.pos.center': 'Centralizado',
    'controls.pos.bottom': 'Inferior',
    'controls.pos.tile': 'Mosaico',
    'controls.opacity': 'Opacidade',
    'controls.size': 'Tamanho',
    'controls.color': 'Cor',
    'controls.rotation': 'Rotação',
    'btn.download': 'Baixar',
    'btn.reset': 'Novo documento',
    'alerts.unsupported':
      'Formato não suportado. Escolha um PDF ou imagem (JPG, PNG, WEBP, BMP, GIF).',
    'alerts.download.error': 'Erro de download: ',
    'page.indicator': 'Página {num} de {total}',
    'errors.pdf': '❌ Erro de PDF: {msg}',
    'errors.generic': '❌ Erro: {msg}',
    'lang.label': 'Idioma',
  },
  nl: {
    'app.title': 'WaterMark — Beveilig uw documenten',
    'header.tagline': 'Veiligheidswatermerk voor administratieve documenten',
    'privacy.badge': '🔒 100% lokaal — uw documenten verlaten nooit uw browser',
    'privacy.link': 'Bekijk op GitHub',
    'footer.bmc': 'Koffie aanbieden',
    'dropzone.title': 'Sleep uw document hierheen',
    'dropzone.subtitle': 'of klik om een bestand te selecteren',
    'controls.presets': 'Snelsjablonen',
    'controls.text': 'Watermerktekst',
    'controls.recipient': 'Ontvanger',
    'controls.recipient.ph': 'Bijv. Bank Janssen',
    'controls.usage': 'Gebruik',
    'controls.usage.ph': 'Bijv. Identiteitsverificatie',
    'controls.date.label': 'Documentdatum',
    'controls.date.hint': 'De variabele {date} gebruikt deze datum.',
    'controls.date.today': 'Vandaag',
    'controls.date.custom': 'Aangepaste datum',
    'controls.appearance': 'Uiterlijk',
    'controls.position': 'Positie',
    'controls.pos.diagonal': 'Diagonaal',
    'controls.pos.center': 'Gecentreerd',
    'controls.pos.bottom': 'Onderaan',
    'controls.pos.tile': 'Tegels',
    'controls.opacity': 'Doorzichtigheid',
    'controls.size': 'Grootte',
    'controls.color': 'Kleur',
    'controls.rotation': 'Rotatie',
    'btn.download': 'Downloaden',
    'btn.reset': 'Nieuw document',
    'alerts.unsupported':
      'Niet-ondersteund formaat. Kies een PDF of afbeelding (JPG, PNG, WEBP, BMP, GIF).',
    'alerts.download.error': 'Downloadfout: ',
    'page.indicator': 'Pagina {num} van {total}',
    'errors.pdf': '❌ PDF-fout: {msg}',
    'errors.generic': '❌ Fout: {msg}',
    'lang.label': 'Taal',
  },
  it: {
    'app.title': 'WaterMark — Proteggi i tuoi documenti',
    'header.tagline': 'Filigrana di sicurezza per documenti amministrativi',
    'privacy.badge': '🔒 100% locale — i tuoi documenti non lasciano mai il browser',
    'privacy.link': 'Vedi su GitHub',
    'footer.bmc': 'Offri un caffè',
    'dropzone.title': 'Trascina qui il tuo documento',
    'dropzone.subtitle': 'o clicca per selezionare un file',
    'controls.presets': 'Modelli rapidi',
    'controls.text': 'Testo filigrana',
    'controls.recipient': 'Destinatario',
    'controls.recipient.ph': 'Es: Banco Rossi',
    'controls.usage': 'Uso',
    'controls.usage.ph': 'Es: Verifica identità',
    'controls.date.label': 'Data documento',
    'controls.date.hint': 'La variabile {date} utilizzerà questa data.',
    'controls.date.today': 'Oggi',
    'controls.date.custom': 'Data personalizzata',
    'controls.appearance': 'Aspetto',
    'controls.position': 'Posizione',
    'controls.pos.diagonal': 'Diagonale',
    'controls.pos.center': 'Centro',
    'controls.pos.bottom': 'In basso',
    'controls.pos.tile': 'Piastrelle',
    'controls.opacity': 'Opacità',
    'controls.size': 'Dimensione',
    'controls.color': 'Colore',
    'controls.rotation': 'Rotazione',
    'btn.download': 'Scarica',
    'btn.reset': 'Nuovo documento',
    'alerts.unsupported':
      'Formato non supportato. Scegli un PDF o immagine (JPG, PNG, WEBP, BMP, GIF).',
    'alerts.download.error': 'Errore download: ',
    'page.indicator': 'Pagina {num} di {total}',
    'errors.pdf': '❌ Errore PDF: {msg}',
    'errors.generic': '❌ Errore: {msg}',
    'lang.label': 'Lingua',
  },
};

const STORAGE_KEY = 'watermark_lang';
let currentLang = 'en';

/**
 * Initialise l'i18n : anglais par défaut, sauf préférence sauvegardée
 */
export function initI18n() {
  // Utiliser la langue sauvegardée sinon anglais par défaut (pas de détection auto)
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && LANGUAGES[saved]) {
    currentLang = saved;
  }

  // Créer le sélecteur de langue dans le header
  createLanguageSelector();

  // Appliquer toutes les traductions
  applyTranslations();
}

/**
 * Change la langue et met à jour l'UI
 */
export function setLanguage(lang, onPresetsChanged = null) {
  if (!LANGUAGES[lang]) return;

  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);

  // Mettre à jour le bouton actif
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
    btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
  });

  // Appliquer les traductions
  applyTranslations();

  // Callback pour re-rendre les presets
  if (onPresetsChanged) onPresetsChanged();

  // Notifier le reste de l'app du changement de langue
  document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));

  // Déclencher un event input sur le textarea pour refresh
  const wmText = document.getElementById('watermark-text');
  if (wmText) wmText.dispatchEvent(new Event('input'));
}

/**
 * Retourne la langue courante
 */
export function getCurrentLanguage() {
  return currentLang;
}

/**
 * Retourne la traduction pour une clé
 */
export function t(key, params = {}) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  let text = dict[key] ?? TRANSLATIONS.en[key] ?? key;

  for (const [k, v] of Object.entries(params)) {
    text = text.replaceAll(`{${k}}`, String(v));
  }
  return text;
}

/**
 * Retourne le texte du preset pour la langue courante
 */
export function getPresetText(id) {
  return PRESET_TEXTS[id]?.[currentLang] ?? PRESET_TEXTS[id]?.en ?? '';
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

  // Language selector: append after tagline, centered by CSS
  header.appendChild(wrapper);
}

function applyTranslations() {
  const dict = TRANSLATIONS[currentLang];

  // Document title
  document.title = dict['app.title'];
  document.documentElement.lang = currentLang;

  // Mapping simple : [sélecteur, property, key]
  const map = [
    ['.header__tagline', 'textContent', 'header.tagline'],
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

  // Labels for="..." — cibler par l'attribut for
  const labelMap = {
    'watermark-text': 'controls.text',
    'opacity': 'controls.opacity',
    'fontsize': 'controls.size',
    'rotation': 'controls.rotation',
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

  // Label "Position" et "Color" (sans for)
  const posLabel = document.querySelector('.control-field label[data-i18n="controls.position"]');
  if (posLabel) posLabel.textContent = dict['controls.position'];
  const colorLabel = document.querySelector('.control-field label[data-i18n="controls.color"]');
  if (colorLabel) colorLabel.textContent = dict['controls.color'];

  // Bouton download — préserver le SVG, mettre à jour le span
  const dlSpan = document.querySelector('#btn-download span[data-i18n="btn.download"]');
  if (dlSpan) dlSpan.textContent = dict['btn.download'];

  // Bouton reset — aria-label seulement (pas de texte visible)
  const resetBtn = document.getElementById('btn-reset');
  if (resetBtn) resetBtn.setAttribute('aria-label', dict['btn.reset']);

  // Date label et hint
  const dateLabel = document.querySelector('label[for="date-picker"]');
  if (dateLabel) dateLabel.textContent = dict['controls.date.label'];

  // Recipient et Usage labels
  const recLabel = document.querySelector('label[for="destinataire"]');
  if (recLabel) recLabel.textContent = dict['controls.recipient'];
  const usageLabel = document.querySelector('label[for="usage"]');
  if (usageLabel) usageLabel.textContent = dict['controls.usage'];

  // Position buttons
  document.querySelectorAll('[data-position]').forEach((btn) => {
    const pos = btn.dataset.position;
    const key = `controls.pos.${pos}`;
    btn.textContent = dict[key];
  });
}
