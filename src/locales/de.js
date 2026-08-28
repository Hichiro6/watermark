/**
 * DE translations for WaterMark
 * Lazy-loaded to reduce initial bundle size
 */

export default {
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
};

export const presetTexts = {
  identite: 'Kopie nur zur Identitätsprüfung\n{date}',
  rib: 'Bankverbindung an {destinataire}\nEinmalige Nutzung — {date}',
  domicile: 'Adressnachweis für {destinataire}\n{date}',
  permis: 'Führerscheinkopie — einmalig\nAn {destinataire} am {date}',
  facture: 'Dokument an {destinataire}\n{date}',
  medical: 'Medizinisches Dokument — streng privat\nNicht verbreiten — {date}',
};
