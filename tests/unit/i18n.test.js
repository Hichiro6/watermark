import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getCurrentLanguage, LANGUAGES, setLanguage, t } from '../../src/i18n.js';

describe('i18n - Core functions', () => {
  beforeEach(() => {
    // localStorage.clear() via notre polyfill
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    setLanguage('en');
  });

  afterEach(() => {
    setLanguage('en');
  });

  it('retourne la bonne langue courante', () => {
    setLanguage('fr');
    expect(getCurrentLanguage()).toBe('fr');
  });

  it('traduit les clés basiques en anglais', () => {
    setLanguage('en');
    expect(t('app.title')).toBe('WaterMark — Secure your documents');
    expect(t('btn.download')).toBe('Download');
  });

  it('traduit les clés en français', () => {
    setLanguage('fr');
    expect(t('app.title')).toBe('WaterMark — Sécurisez vos documents');
    expect(t('btn.download')).toBe('Télécharger');
  });

  it('retourne la clé si non traduite', () => {
    expect(t('key.nonexistent')).toBe('key.nonexistent');
  });

  it('gère les paramètres de substitution', () => {
    setLanguage('en');
    const result = t('page.indicator', { num: 1, total: 10 });
    expect(result).toContain('Page 1');
    expect(result).toContain('of 10');
  });

  it('persiste la langue dans localStorage', () => {
    setLanguage('de');
    expect(localStorage.getItem('watermark_lang')).toBe('de');
  });
});

describe('i18n - Languages map', () => {
  it('contient toutes les langues attendues', () => {
    expect(Object.keys(LANGUAGES)).toEqual(['en', 'fr', 'de', 'es', 'pt', 'nl', 'it']);
  });

  it('a des noms et drapeaux pour chaque langue', () => {
    expect(LANGUAGES.en.name).toBe('English');
    expect(LANGUAGES.fr.flag).toBe('🇫🇷');
    expect(LANGUAGES.de.name).toBe('Deutsch');
  });
});

describe('i18n - Fallback', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reste en anglais si langue invalide', () => {
    setLanguage('invalid'); // setLanguage ignore les langues invalides
    expect(getCurrentLanguage()).toBe('en');
  });

  it('retourne des textes pour les clés courantes en FR', () => {
    setLanguage('fr');
    expect(t('header.tagline')).toBeDefined();
    expect(t('btn.download')).toBe('Télécharger');
  });
});
