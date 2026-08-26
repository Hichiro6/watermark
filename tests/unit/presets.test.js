import { describe, expect, it } from 'vitest';
import { PRESET_TEXTS } from '../../src/i18n.js';

describe('PRESET_TEXTS - Multilingue', () => {
  const expectedIds = ['identite', 'rib', 'domicile', 'permis', 'facture', 'medical'];
  const expectedLangs = ['en', 'fr', 'de', 'es', 'pt'];

  it('contient tous les presets attendus', () => {
    expect(Object.keys(PRESET_TEXTS)).toEqual(expectedIds);
  });

  it('chaque preset a des traductions pour toutes les langues', () => {
    expectedIds.forEach((id) => {
      expectedLangs.forEach((lang) => {
        expect(PRESET_TEXTS[id][lang]).toBeDefined();
        expect(typeof PRESET_TEXTS[id][lang]).toBe('string');
      });
    });
  });

  it('préserve les variables {date} dans toutes les langues', () => {
    expectedIds.forEach((id) => {
      expectedLangs.forEach((lang) => {
        expect(PRESET_TEXTS[id][lang]).toContain('{date}');
      });
    });
  });

  it('préserve la variable {destinataire} quand approprié', () => {
    ['rib', 'domicile', 'permis', 'facture'].forEach((id) => {
      expectedLangs.forEach((lang) => {
        expect(PRESET_TEXTS[id][lang]).toContain('{destinataire}');
      });
    });
  });

  it("ne contient pas {usage} (supprimé de l'app)", () => {
    expectedIds.forEach((id) => {
      expectedLangs.forEach((lang) => {
        expect(PRESET_TEXTS[id][lang]).not.toContain('{usage}');
      });
    });
  });

  it('texte français pour identite', () => {
    expect(PRESET_TEXTS.identite.fr).toBe("Copie pour vérification d'identité uniquement\n{date}");
  });

  it('texte allemand pour medical', () => {
    expect(PRESET_TEXTS.medical.de).toBe(
      'Medizinisches Dokument — streng privat\nNicht verbreiten — {date}',
    );
  });
});
