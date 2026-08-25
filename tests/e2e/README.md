# Tests E2E — WaterMark PWA

Suite de tests automatisés complète pour l'application WaterMark PWA.

## 🚀 Lancement

```bash
# Tous les tests (headless)
npm test

# Mode interactif (UI Playwright)
npm run test:ui

# Mode visible (headed browser)
npm run test:headed

# Voir le rapport HTML
npm run test:report
```

## 📋 Couverture

### 01-upload-preview.spec.js — Upload et Preview
- Upload PNG → canvas visible
- Upload JPG → canvas visible
- Upload PDF multi-pages → un canvas par page
- Indicateur "Page X de Y" visible
- Format non supporté → alerte
- Drag & drop

### 02-ui-controls.spec.js — Contrôles UI
- Slider opacity (5% ↔ 100%)
- Slider fontSize (16px ↔ 120px)
- Slider rotation (-90° ↔ 90°)
- Boutons couleur (sélection active/inactive)
- Contrôle de position (diagonal, center, bottom, tile)
- Date picker ("Aujourd'hui" par défaut, mode personnalisé)
- Presets (6 disponibles, application du texte)
- Inputs destinataire et usage
- Sliders avec PDF → preview mise à jour

### 03-download.spec.js — Téléchargement
- Image → fichier PNG valide
- PDF → fichier avec header `%PDF-`
- Nom de fichier dérivé du nom original
- Guard: pas de download sans fichier uploadé

### 04-positions-reset.spec.js — Positions et Reset
- Position diagonal (par défaut)
- Position center (sans rotation)
- Position bottom
- Position mosaic (tile)
- Changement cyclique de positions
- Reset → restore l'état initial
- Reset puis nouvel upload

### 05-non-regression.spec.js — Non-régression
- Rotation positive = sens horaire
- Rotation négative = sens anti-horaire
- Position center ignore la rotation
- Guard handleDownload() PDF vs image
- canvasesToPdf() → header `%PDF-` + `%%EOF`
- Pas d'erreurs console (PDF + image)
- Nombre de canvases = nombre de pages PDF

### 06-edge-cases.spec.js — Edge Cases
- Image très grande (2000x2000)
- Texte watermark très long (1000+ caractères)
- Opacity minimale (5%) et maximale (100%)
- Rotation -90°, 0°, +90°
- FontSize minimale (16px) et maximale (120px)
- Combinaison extrême (opacity 5% + rotation -90° + fontsize 120px)
- PDF 10 pages → 10 canvases
- Toutes les couleurs applicables
- Upload PDF → reset → upload image
- Substitution des variables {date} {destinataire} {usage}

## 🛠️ Infrastructure

### Helpers
- `helpers/test-fixtures-gen.js` — Génère PDFs et images de test via pdf-lib et canvas

### Structure
```
tests/e2e/
├── 01-upload-preview.spec.js
├── 02-ui-controls.spec.js
├── 03-download.spec.js
├── 04-positions-reset.spec.js
├── 05-non-regression.spec.js
├── 06-edge-cases.spec.js
├── helpers/
│   └── test-fixtures-gen.js
├── fixtures/          # fichiers générés (gitignore)
└── results/           # rapports et artefacts (gitignore)
```

## 📊 Rapports

Les rapports HTML sont générés dans `tests/e2e/results/report/`.

En cas d'échec :
- **Screenshots** capturés automatiquement
- **Vidéos** conservées pour les tests en échec
- **Traces** disponibles pour le premier retry

## ⚙️ Configuration

Le serveur dev Vite est démarré automatiquement par Playwright (`webServer` dans `playwright.config.js`).

Pour tester contre un serveur déjà lancé : `npm run dev` dans un terminal, puis `npm test`.
