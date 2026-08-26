# Audit Tests & Qualité — Projet WaterMark

**Date**: 26 août 2026  
**Projet**: `./` (WaterMark PWA)  
**Stack**: Vite + Vanilla JS (PDF.js, pdf-lib) + Playwright E2E + Vitest + Biome  

---

## 1. Tests Existants

### Récapitulatif

| Type | Fichier | Tests | Description |
|------|---------|-------|-------------|
| E2E | `01-upload-preview.spec.js` | 6 | Upload PNG/JPG/PDF, drag&drop, formats non supportés |
| E2E | `02-ui-controls.spec.js` | 8 | Sliders (opacity, fontSize, rotation), boutons couleur, position, presets, date picker |
| E2E | `03-download.spec.js` | 5 | Download PNG/PDF, nom de fichier, guard sans fichier |
| E2E | `04-positions-reset.spec.js` | 7 | Positions (diagonal, center, bottom, tile), reset, re-upload |
| E2E | `05-non-regression.spec.js` | 10 | Rotation (+/-), guard handleDownload, canvasesToPdf, erreurs console |
| E2E | `06-edge-cases.spec.js` | 14 | Images grandes, texte long, valeurs extrêmes, PDF 10 pages, combinaisons |
| E2E | `a11y.spec.js` | 1 | Accessibilité axe-core (WCAG 2.0 A/AA) |
| Unit | `i18n.test.js` | 12 | `t()`, `setLanguage()`, `getPresetText()`, traductions |
| Unit | `presets.test.js` | 5 | Validation des données, unicité des IDs |

**Total: 68 tests** (50 E2E + 1 a11y + 17 unitaires) — tous PASSANTS ✅

### Infrastructure de test

```
tests/
├── unit/
│   ├── i18n.test.js            # Tests unitaires i18n (12 tests)
│   ├── presets.test.js         # Tests unitaires presets (5 tests)
│   └── setup.js                # Polyfill localStorage pour jsdom
├── e2e/
│   ├── 01-upload-preview.spec.js
│   ├── 02-ui-controls.spec.js
│   ├── 03-download.spec.js
│   ├── 04-positions-reset.spec.js
│   ├── 05-non-regression.spec.js
│   ├── 06-edge-cases.spec.js
│   ├── a11y.spec.js            # Test accessibilité axe-core
│   ├── globalSetup.js
│   ├── setup/
│   │   ├── locale-setup.js     # Fixture personnalisée pour French locale
│   │   └── inject-locale.js    # Script généré par globalSetup
│   ├── helpers/
│   │   ├── test-utils.js       # uploadTestFile(), waitForCanvasRender()
│   │   └── test-fixtures-gen.js # createTestPdf(), createTestImage()
│   ├── fixtures/               # Fichiers de test générés (gitignored)
│   └── results/                # Rapports HTML, vidéos, screenshots (gitignored)
└── vitest.config.js            # Config Vitest (jsdom, coverage V8)
```

### Commandes disponibles

```bash
npm run test           # Vitest en watch mode
npm run test:run       # Vitest run (once)
npm run test:coverage  # Vitest + rapport coverage
npm run test:unit      # Vitest run (alias)
npm run test:e2e       # Playwright (tous les tests E2E)
npm run test:ui        # Mode UI Playwright
npm run test:headed    # Mode visible Playwright
npm run test:report    # Ouvrir le rapport HTML Playwright
npm run lint           # Biome check
npm run format         # Biome format --write
```

---

## 2. Couverture de Code

### Analyse statique des fonctions source

| Fichier | Lignes | Fonctions | Testé ? | Coverage |
|---------|--------|-----------|---------|----------|
| `src/main.js` | 559 | ~12 | ✅ E2E | Partiel |
| `src/image-handler.js` | 114 | 1 (export) | ✅ E2E | 0% |
| `src/i18n.js` | 424 | ~10 | ✅ Unit + E2E | 39% |
| `src/presets.js` | 46 | 0 (données) | ✅ Unit + E2E | 0% |
| `public/sw.js` | 50 | ~3 | ❌ Non testé | N/A |

**Coverage globale (V8)**: 22% stmts / 15% branches / 23% funcs / 23% lines

### Ce qui n'est PAS couvert

1. **Service Worker** (`public/sw.js`) — aucun test PWA/offline
2. **`image-handler.js`** — pas de tests unitaires (couvert via E2E uniquement)
3. **`main.js`** — logique UI couverte via E2E mais pas de tests unitaires isolés
4. **Gestion d'erreurs PDF.js** — erreurs réseau/corruption non simulées
5. **Compatibilité navigateurs** — seul Chromium testé (pas Firefox/Safari)

---

## 3. Linting & Formatting

### État actuel: **CONFIGURÉ** ✅

- ✅ **Biome** v2.5.10 (`biome.json`) — lint + format combiné, remplace ESLint + Prettier
- ✅ Aucun diagnostic résiduel sur `src/` et `tests/unit/`
- ✅ Scripts npm: `lint`, `format`
- ❌ Pas de EditorConfig
- ❌ Pas de husky/pre-commit hooks

### Corrections appliquées par Biome

- `useTemplate` → template literals au lieu de concaténation string
- `parseInt` → radix 10 explicite
- `useIterableCallbackReturn` → callbacks `forEach` corrigés (pas de return implicite)
- Imports/variables inutilisés supprimés
- Formatting automatique (2 espaces, sans parenthèses superflues)

### Pourquoi Biome et pas ESLint ?

Biome est un outil moderne (Rust-based) qui combine **linting + formatting** en un seul outil :
- **10x plus rapide** qu'ESLint + Prettier
- **Zéro config** par défaut (convention raisonnable)
- **Tout-en-un** — pas besoin de gérer ESLint + Prettier + eslint-config-prettier
- Diagnostic clairs et auto-fix puissant

---

## 4. Configuration Actuelle

### Playwright (`playwright.config.js`)

- ✅ Timeout 60s par test, 10s par expect
- ✅ Retry automatique sur CI (2 fois)
- ✅ Reporter HTML + line + list
- ✅ Screenshot sur échec
- ✅ Vidéo sur échec
- ✅ Trace sur premier retry
- ✅ French locale forcée via `page.addInitScript()`
- ✅ WebServer auto (Vite dev server)

### Vitest (`vitest.config.js`)

- ✅ Environment `jsdom`
- ✅ Setup file (`tests/unit/setup.js`) — polyfill `localStorage`
- ✅ Coverage V8 (`@vitest/coverage-v8`)
- ✅ Thresholds: 20% stmts / 10% branches / 20% funcs / 20% lines
- ✅ Include: `tests/unit/**/*.test.js`

### Vite (`vite.config.js`)

- Minimal, correct pour une PWA Vanilla
- ✅ Config de test unitaire intégrée via Vitest

---

## 5. Améliorations Restantes

### Accessibilité
- ✅ **axe-core** — test E2E créé (`a11y.spec.js`, WCAG 2.0 A/AA)

### Couverture
- [ ] Augmenter coverage `image-handler.js` (tests unitaires)
- [ ] Ajouter tests unitaires pour `main.js` (fonctions pures)
- [ ] Playwright code coverage (V8 native)

### Multi-browser
- [ ] Ajouter Firefox à la matrice de test Playwright
- [ ] Tester Safari (via BrowserStack ou local)

### PWA & Offline
- [ ] Tests Service Worker (Workbox ou Playwright interception)
- [ ] Tests mode hors-ligne

### Qualité
- [ ] EditorConfig
- [ ] Pre-commit hooks (Husky + lint-staged)
- [ ] Lighthouse CI — audits PWA, perf, a11y

---

## 6. Roadmap Priorisée

| Priority | Action | Statut | Effort |
|----------|--------|--------|--------|
| HIGH | Biome (lint + format) | ✅ Done | 1h |
| HIGH | Vitest + tests unitaires i18n | ✅ Done | 4h |
| HIGH | Coverage V8 | ✅ Done | 1h |
| MED | axe-core a11y tests | ✅ Done | 3h |
| MED | Tests unitaires image-handler | ⬜ À faire | 2h |
| MED | Tests unitaires main.js | ⬜ À faire | 4h |
| LOW | Playwright coverage | ⬜ À faire | 2h |
| LOW | Tests Service Worker | ⬜ À faire | 6h |
| LOW | Multi-browser (Firefox) | ⬜ À faire | 2h |
| LOW | Lighthouse CI | ⬜ À faire | 4h |
| LOW | Pre-commit hooks | ⬜ À faire | 1h |

---

## 7. Conclusion

### Points forts

- Suite E2E complète (50 tests) — tous passants
- Tests unitaires Vitest (17 tests) — tous passants
- Test d'accessibilité axe-core configuré
- Linting Biome propre (0 erreur)
- Coverage V8 activée et mesurée
- Helpers bien organisés (fixtures, utils)
- Configuration Playwright robuste (retry, timeout, locale)

### Points d'amélioration

- Coverage encore faible sur `image-handler.js` et `main.js`
- Service Worker non testé
- Uniquement Chromium testé
- Pas de pre-commit hooks

**Score qualité estimé**: 8/10

La base de test est solide (E2E + unitaires + a11y + linting). L'ajout de tests unitaires sur les modules non couverts et le multi-browser feraient passer ce projet à 9-10/10.
