/**
 * PT translations for WaterMark
 * Lazy-loaded to reduce initial bundle size
 */

export default {
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
  };


export const presetTexts = {
  identite: 'Cópia apenas para verificação de identidade\n{date}',
  rib: 'Dados bancários enviados para {destinataire}\nUso único — {date}',
  domicile: 'Comprovante de residência para {destinataire}\n{date}',
  permis: 'Cópia da licença — uso único\nEnviada para {destinataire} em {date}',
  facture: 'Documento enviado para {destinataire}\n{date}',
  medical: 'Documento médico — estritamente privado\nNão distribuir — {date}',
};
