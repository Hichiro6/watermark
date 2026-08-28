/**
 * NL translations for WaterMark
 * Lazy-loaded to reduce initial bundle size
 */

export default {
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
};

export const presetTexts = {
  identite: 'Kopie alleen voor identiteitsverificatie\n{date}',
  rib: 'Bankgegevens verzonden aan {destinataire}\nEenmalig gebruik — {date}',
  domicile: 'Bewijs van adres voor {destinataire}\n{date}',
  permis: 'Rijbewijskopie — eenmalig\nVerzonden aan {destinataire} op {date}',
  facture: 'Document verzonden aan {destinataire}\n{date}',
  medical: 'Medisch document — strikt privé\nNiet verspreiden — {date}',
};
