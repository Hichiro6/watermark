/**
 * EN translations for WaterMark
 * Lazy-loaded to reduce initial bundle size
 */

export default {
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
};

export const presetTexts = {
  identite: 'Copy for identity verification only\n{date}',
  rib: 'Bank details sent to {destinataire}\nSingle use — {date}',
  domicile: 'Proof of address for {destinataire}\n{date}',
  permis: 'License copy — single use\nSent to {destinataire} on {date}',
  facture: 'Document sent to {destinataire}\n{date}',
  medical: 'Medical document — strictly private\nDo not distribute — {date}',
};
