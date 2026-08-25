// Presets de texte prédéfinis pour les cas d'usage courants

export const PRESETS = [
  {
    id: 'identite',
    icon: '🪪',
    label: 'Pièce d\'identité',
    hint: 'Vérification identité',
    text: 'Copie pour vérification d\'identité uniquement\n{date}',
  },
  {
    id: 'rib',
    icon: '🏦',
    label: 'RIB / IBAN',
    hint: 'Transmission banque',
    text: 'RIB transmis à {destinataire}\nUsage unique — {date}',
  },
  {
    id: 'domicile',
    icon: '🏠',
    label: 'Justificatif domicile',
    hint: 'Adresse',
    text: 'Justificatif de domicile pour {destinataire}\n{date}',
  },
  {
    id: 'permis',
    icon: '🚗',
    label: 'Permis de conduire',
    hint: 'Vérification',
    text: 'Copie du permis — usage unique\nTransmis à {destinataire} le {date}',
  },
  {
    id: 'facture',
    icon: '📄',
    label: 'Facture / Devis',
    hint: 'Transmission',
    text: 'Document transmis à {destinataire}\n{date}',
  },
  {
    id: 'medical',
    icon: '⚕️',
    label: 'Document médical',
    hint: 'Usage restreint',
    text: 'Document médical — usage strictement privé\nNe pas diffuser — {date}',
  },
];
