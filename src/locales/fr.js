/**
 * FR translations for WaterMark
 * Lazy-loaded to reduce initial bundle size
 */

export default {
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
  };


export const presetTexts = {
  identite: 'Copie pour vérification d\'identité uniquement\n{date}',
  rib: 'RIB transmis à {destinataire}\nUsage unique — {date}',
  domicile: 'Justificatif de domicile pour {destinataire}\n{date}',
  permis: 'Copie du permis — usage unique\nTransmis à {destinataire} le {date}',
  facture: 'Document transmis à {destinataire}\n{date}',
  medical: 'Document médical — usage strictement privé\nNe pas diffuser — {date}',
};
