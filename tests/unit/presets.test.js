import { beforeAll, describe, expect, it } from 'vitest';

const expectedIds = ['identite', 'rib', 'domicile', 'permis', 'facture', 'medical'];
const expectedLangs = ['en', 'fr', 'de', 'es', 'pt'];

/**
 * Load presetTexts for all languages dynamically (lazy-loaded i18n)
 */
async function loadAllPresetTexts() {
  const presets = {};
  for (const lang of expectedLangs) {
    const mod = await import(`../../src/locales/${lang}.js`);
    presets[lang] = mod.presetTexts;
  }
  return presets;
}

describe('Preset texts - Multilingue', () => {
  let allPresets;

  beforeAll(async () => {
    allPresets = await loadAllPresetTexts();
  });

  it('chaque langue a tous les presets attendus', () => {
    for (const lang of expectedLangs) {
      expect(Object.keys(allPresets[lang])).toEqual(expectedIds);
    }
  });

  it('chaque preset a des traductions pour toutes les langues', () => {
    expectedIds.forEach((id) => {
      expectedLangs.forEach((lang) => {
        expect(allPresets[lang][id]).toBeDefined();
        expect(typeof allPresets[lang][id]).toBe('string');
      });
    });
  });

  it('préserve les variables {date} dans toutes les langues', () => {
    expectedIds.forEach((id) => {
      expectedLangs.forEach((lang) => {
        expect(allPresets[lang][id]).toContain('{date}');
      });
    });
  });

  it('préserve la variable {destinataire} quand approprié', () => {
    ['rib', 'domicile', 'permis', 'facture'].forEach((id) => {
      expectedLangs.forEach((lang) => {
        expect(allPresets[lang][id]).toContain('{destinataire}');
      });
    });
  });

  it("ne contient pas {usage} (supprimé de l'app)", () => {
    expectedIds.forEach((id) => {
      expectedLangs.forEach((lang) => {
        expect(allPresets[lang][id]).not.toContain('{usage}');
      });
    });
  });

  it('texte français pour identite', () => {
    expect(allPresets.fr.identite).toBe("Copie pour vérification d'identité uniquement\n{date}");
  });

  it('texte allemand pour medical', () => {
    expect(allPresets.de.medical).toBe(
      'Medizinisches Dokument — streng privat\nNicht verbreiten — {date}',
    );
  });
});
