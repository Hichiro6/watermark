/**
 * ES translations for WaterMark
 * Lazy-loaded to reduce initial bundle size
 */

export default {
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
  'alerts.unsupported': 'Formato no compatible. Elige un PDF o imagen (JPG, PNG, WEBP, BMP, GIF).',
  'alerts.download.error': 'Error de descarga: ',
  'page.indicator': 'Página {num} de {total}',
  'errors.pdf': '❌ Error de PDF: {msg}',
  'errors.generic': '❌ Error: {msg}',
  'lang.label': 'Idioma',
};

export const presetTexts = {
  identite: 'Copia solo para verificación de identidad\n{date}',
  rib: 'Datos bancarios enviados a {destinataire}\nUso único — {date}',
  domicile: 'Justificante de domicilio para {destinataire}\n{date}',
  permis: 'Copia de licencia — uso único\nEnviada a {destinataire} el {date}',
  facture: 'Documento enviado a {destinataire}\n{date}',
  medical: 'Documento médico — estrictamente privado\nNo distribuir — {date}',
};
