# Audit Tests & Qualité — Projet Watermark

**Date**: 26 août 2026  
**Projet**: `./` (WaterMark PWA)  
**Stack**: Vite + Vanilla JS (PDF.js, pdf-lib) + Playwright E2E

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

**Total: 50 tests E2E** — tous PASSANTS ✅

### Infrastructure de test

```
tests/e2e/
├── 01-upload-preview.spec.js
├── 02-ui-controls.spec.js
├── 03-download.spec.js
├── 04-positions-reset.spec.js
├── 05-non-regression.spec.js
├── 06-edge-cases.spec.js
├── globalSetup.js
├── setup/
│   ├── locale-setup.js     # Fixture personnalisée pour French locale
│   └── inject-locale.js    # Script généré par globalSetup
├── helpers/
│   ├── test-utils.js          # uploadTestFile(), waitForCanvasRender()
│   └── test-fixtures-gen.js   # createTestPdf(), createTestImage()
├── fixtures/                  # Fichiers de test générés (gitignored)
└── results/                   # Rapports HTML, vidéos, screenshots (gitignored)
```

### Commandes disponibles

```bash
npm test              # Tous les tests (headless)
npm run test:ui       # Mode UI Playwright
npm run test:headed   # Mode visible
npm run test:report   # Ouvrir le rapport HTML
```

---

## 2. Couverture de Code

### Analyse statique des fonctions source

| Fichier | Lignes | Fonctions | Testé via E2E? |
|---------|--------|-----------|----------------|
| `src/main.js` | 535 | ~12 | ✅ Majoritairement |
| `src/pdf-handler.js` | 116 | 1 (export) | ✅ Via download PDF |
| `src/image-handler.js` | 116 | 1 (export) | ✅ Via download image |
| `src/i18n.js` | 424 | ~10 | ⚠️ Partiellement (pas de test unitaire) |
| `src/presets.js` | 46 | 0 (données) | ✅ Via UI tests |
| `public/sw.js` | 50 | ~3 | ❌ Pas testé |

**Couverture estimée**: ~75-85% des fonctions principales via E2E

### Ce qui n'est PAS couvert

1. **Service Worker** (`public/sw.js`) — aucun test PWA/offline
2. **Logique i18n** — pas de tests unitaires pour `setLanguage()`, `getPresetText()`
3. **Gestion d'erreurs PDF.js** — erreurs réseau/corruption non simulées
4. **Edge cases mémoire** — gros fichiers PDF (>50 pages)
5. **Compatibilité navigateurs** — seul Chromium testé (pas Firefox/Safari)
6. **Variables d'environnement** — pas de config différente pour dev/prod

---

## 3. Linting & Formatting

### État actuel: **AUCUNE CONFIG** ❌

- ❌ Pas de ESLint/ESLint config
- ❌ Pas de Prettier/prettierrc
- ❌ Pas de Biome
- ❌ Pas de EditorConfig
- ❌ Pas de husky/pre-commit hooks

**Conséquence**: Style de code non uniforme, risque de régressions syntaxiques.

### Recommandations

1. **Biome** (recommandé) — Fast, Rust-based, remplace ESLint+Prettier:
   ```bash
   npm install -D @biomejs/biome
   npx biome init
   ```

2. **ESLint + Prettier** (classique):
   ```bash
   npm install -D eslint prettier eslint-config-prettier
   npx eslint --init
   ```

3. **Pre-commit hook** (Husky):
   ```bash
   npm install -D husky lint-staged
   npx husky install
   npx husky add .husky/pre-commit "npx lint-staged"
   ```

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
- ⚠️ **Aucune configuration de couverture**

### Vite (`vite.config.js`)

- Minimal, correct pour une PWA Vanilla
- ❌ Pas de config de test unitaire (Vitest)

---

## 5. Stratégie de Test Proposée

### Niveau 1: Tests Unitaires (Vitest)

Ajouter **Vitest** pour les fonctions pures:

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom', // ou 'jsdom'
    include: ['src/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

**Tests à ajouter:**
- `src/i18n.test.js` — `t()`, `setLanguage()`, `getPresetText()`
- `src/presets.test.js` — validation des données
- `src/image-handler.test.js` — unit tests (avec jsdom)
- `src/pdf-handler.test.js` — mock pdf-lib

### Niveau 2: Couverture E2E améliorée

- [ ] Ajouter **Playwright code coverage** (V8 native)
- [ ] Configurer `coverageConfig` dans `playwright.config.js`

```javascript
use: {
  coverage: true,
  coverageReporters: ['html', 'text'],
},
```

### Niveau 3: Accessibilité & Performance

- [ ] **Lighthouse CI** — audits PWA, perf, a11y
- [ ] **axe-core** — tests d'accessibilité via Playwright

```javascript
import AxeBuilder from '@axe-core/playwright';

test('accessibility', async ({ page }) => {
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### Niveau 4: Multi-browser

- [ ] Ajouter Firefox à la matrice de test Playwright
- [ ] Tester Safari (via BrowserStack ou local)

### Niveau 5: PWA Offline Testing

- [ ] Tests Service Worker (Workbox ou Playwright interception)
- [ ] Tests mode hors-ligne

### Niveau 6: CI/CD Integration

- [ ] GitHub Actions / GitLab CI
- [ ] Coverage badge (Coveralls/Codecov)
- [ ] PR checks automatiques

---

## 6. Roadmap Priorisée

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| HIGH | Ajouter Biome | 1h | Haut |
| HIGH | Ajouter Vitest pour i18n | 4h | Moyen |
| MED | Configurer Playwright coverage | 2h | Moyen |
| MED | Ajouter axe-core a11y tests | 3h | Moyen |
| LOW | Tests Service Worker | 6h | Faible |
| LOW | Multi-browser (Firefox) | 2h | Faible |
| LOW | Lighthouse CI | 4h | Faible |

---

## 7. Conclusion

### Points forts

- Suite E2E complète (50 tests) — tous passants
- Bonne couverture fonctionnelle via Playwright
- Helpers bien organisés (fixtures, utils)
- Rapport HTML avec traces/screenshots
- Configuration Playwright robuste (retry, timeout, locale)

### Points d'amélioration

- Aucune config linting/formatting
- Pas de tests unitaires
- Pas de couverture de code mesurée
- Service Worker non testé
- Uniquement Chromium testé

**Score qualité estimé**: 6/10

La base E2E est solide. L'ajout de tests unitaires et de linting ferait passer ce projet à 8-9/10.
