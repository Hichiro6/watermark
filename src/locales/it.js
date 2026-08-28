/**
 * IT translations for WaterMark
 * Lazy-loaded to reduce initial bundle size
 */

export default {
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
};

export const presetTexts = {
  identite: 'Copia solo per verifica identità\n{date}',
  rib: 'Dati bancari inviati a {destinataire}\nUso singolo — {date}',
  domicile: 'Prova di residenza per {destinataire}\n{date}',
  permis: 'Copia patente — uso singolo\nInviata a {destinataire} il {date}',
  facture: 'Documento inviato a {destinataire}\n{date}',
  medical: 'Documento medico — strettamente privato\nNon distribuire — {date}',
};
