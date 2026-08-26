# E2E Tests — WaterMark PWA

Comprehensive automated test suite for the WaterMark PWA application.

## 🚀 Getting Started

```bash
# All tests (headless)
npm test

# Interactive mode (Playwright UI)
npm run test:ui

# Visible mode (headed browser)
npm run test:headed

# View HTML report
npm run test:report
```

## 📋 Coverage

### 01-upload-preview.spec.js — Upload & Preview
- Upload PNG → visible canvas
- Upload JPG → visible canvas
- Upload multi-page PDF → one canvas per page
- "Page X of Y" indicator visible
- Unsupported format → alert
- Drag & drop

### 02-ui-controls.spec.js — UI Controls
- Opacity slider (5% ↔ 100%)
- Font size slider (16px ↔ 120px)
- Rotation slider (-90° ↔ 90°)
- Color buttons (active/inactive selection)
- Position control (diagonal, center, bottom, tile)
- Date picker ("Today" by default, custom mode)
- Presets (6 available, text application)
- Recipient and usage inputs
- Sliders with PDF → preview update

### 03-download.spec.js — Download
- Image → valid PNG file
- PDF → file with `%PDF-` header
- Filename derived from original name
- Guard: no download without uploaded file

### 04-positions-reset.spec.js — Positions & Reset
- Diagonal position (default)
- Center position (no rotation)
- Bottom position
- Tile (mosaic) position
- Cyclic position switching
- Reset → restore initial state
- Reset then new upload

### 05-non-regression.spec.js — Non-Regression
- Positive rotation = clockwise
- Negative rotation = counter-clockwise
- Center position ignores rotation
- handleDownload() guard PDF vs image
- canvasesToPdf() → header `%PDF-` + `%%EOF`
- No console errors (PDF + image)
- Canvas count = PDF page count

### 06-edge-cases.spec.js — Edge Cases
- Very large image (2000x2000)
- Very long watermark text (1000+ characters)
- Minimum opacity (5%) and maximum (100%)
- Rotation -90°, 0°, +90°
- Minimum font size (16px) and maximum (120px)
- Extreme combination (opacity 5% + rotation -90° + fontsize 120px)
- 10-page PDF → 10 canvases
- All applicable colors
- Upload PDF → reset → upload image
- Variable substitution {date} {recipient} {usage}

## 🛠️ Infrastructure

### Helpers
- `helpers/test-fixtures-gen.js` — Generates test PDFs and images via pdf-lib and canvas

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
├── fixtures/          # generated files (gitignored)
└── results/           # reports and artifacts (gitignored)
```

## 📊 Reports

HTML reports are generated in `tests/e2e/results/report/`.

On failure:
- **Screenshots** captured automatically
- **Videos** retained for failed tests
- **Traces** available for first retry

## ⚙️ Configuration

The Vite dev server is started automatically by Playwright (`webServer` in `playwright.config.js`).

To test against an already-running server: run `npm run dev` in a terminal, then `npm test`.
