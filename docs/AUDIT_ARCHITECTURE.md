# 🏛️ Architectural Audit — WaterMark PWA

**Audit Date**: 2026-08-26  
**Project Version**: 1.0.0  
**Developer**: Hichiro  
**License**: CC-BY-NC-ND-4.0  

---

## 📋 Executive Summary

WaterMark is a **100% client-side PWA (Progressive Web App)** designed to add security watermarks to administrative documents (PDFs and images). The architecture adopts a **"zero-trust data"** approach: no document ever leaves the user's browser.

**Overall Grade**: ⭐⭐⭐⭐☆ (4/5)  
**Security**: A- (Excellent)  
**Maintainability**: B+ (Good)  
**Performance**: A (Excellent)  

---

## 1. Project Structure

```
/
├── public/
│   ├── favicon.svg           # Application icon
│   ├── manifest.json         # PWA manifest
│   └── sw.js                 # Service Worker (offline cache)
├── src/
│   ├── main.js               # Entry point, main UI logic
│   ├── i18n.js               # Translation system (EN, FR, DE, ES, PT)
│   ├── image-handler.js      # Image processing via Canvas API
│   ├── pdf-handler.js        # PDF processing via pdf-lib (NOT USED in prod)
│   └── presets.js            # Predefined watermark presets
├── styles/
│   └── main.css              # Global styles (808 lines, pure CSS)
├── tests/e2e/
│   ├── 01-upload-preview.spec.js
│   ├── 02-ui-controls.spec.js
│   ├── 03-download.spec.js
│   ├── 04-positions-reset.spec.js
│   ├── 05-non-regression.spec.js
│   ├── 06-edge-cases.spec.js
│   ├── fixtures/             # Test files (PDF, images)
│   └── helpers/              # Test utilities
├── index.html                # Single HTML template (SPA)
├── vite.config.js            # Vite configuration
├── playwright.config.js      # Playwright configuration
├── package.json              # Dependencies and scripts
├── Dockerfile                # Multi-stage build
├── docker-compose.yml        # Docker Compose orchestration
├── nginx.conf                # Production server configuration
├── SECURITY_AUDIT.md         # Previous security report
├── README.md                 # User documentation
└── test-pdf.js               # Manual test script (deprecated)
```

**Statistics**:
- **47 source files** (excluding node_modules, .git, dist, test artifacts)
- **~17K lines of code** (including CSS)
- **6 E2E tests** covering critical workflows
- **0 backend dependencies** — Purely client-side

---

## 2. Technologies Used

### Frontend Core

| Technology | Version | Usage |
|-------------|---------|-------|
| **Vite** | ^5.4.0 | Build tool, dev server |
| **Vanilla JS** | ES Modules | Application logic (0 framework) |
| **Canvas API** | Native | Watermark rendering on images/PDFs |
| **PDF.js** | ^6.2.108 | PDF parsing and rendering (Mozilla) |
| **pdf-lib** | ^1.17.1 | PDF creation (used in `canvasesToPdf`) |

### Infrastructure & Deployment

| Tool | Usage |
|------|-------|
| **Docker** | Multi-stage build, deployment |
| **nginx** | Reverse proxy, static serving, caching |
| **Playwright** | Automated E2E tests |

### Internationalization
- **5 languages supported**: EN (primary), FR, DE, ES, PT
- **Native translations**: No external library (custom i18n.js, ~17KB)
- **Auto-detection**: Automatic browser language detection

### PWA Capabilities
- **Service Worker**: Cache-first strategy, offline support
- **Manifest**: Device installation, icons, theme color
- **Responsive**: Mobile-first CSS, touch targets ≥ 44px

---

## 3. Architectural Strengths

### ✅ Security & Privacy (Grade A-)
1. **Zero data exfiltration**: No network calls (`fetch`, `XMLHttpRequest`, `WebSocket`) in source code
2. **In-memory processing**: Documents never written to disk, only in browser RAM
3. **Strict sanitization**: MIME type whitelist, filenames cleaned before download
4. **Hardened PDF.js**: `isEvalSupported: false` disables malicious JS execution in PDFs
5. **No API keys, secrets, or telemetry** in code

### ✅ Performance (Grade A)
1. **Ultra-lightweight build**: Vite + no framework ≈ <500KB total bundle
2. **Incremental rendering**: 300ms debounce on option changes
3. **Smart pagination**: Yield to browser every 5 PDF pages
4. **Aggressive HTTP caching**: Immutable headers on static assets (1 year)
5. **Gzip enabled**: Text/CSS/JS compression on nginx side

### ✅ Code Quality (Grade B+)
1. **Modular architecture**: Clear separation between handlers (image, pdf), i18n, presets
2. **Comprehensive E2E tests**: 6 scenarios covering upload, preview, download, edge cases
3. **Rich documentation**: `SECURITY_AUDIT.md`, `README.md`, JSDoc comments
4. **Built-in accessibility**: `prefers-reduced-motion`, `prefers-contrast`, implicit aria-labels

### ✅ DevOps & Maintainability (Grade B+)
1. **Multi-stage Docker**: Isolated build, final nginx alpine image (~25MB)
2. **Health checks**: Liveness/readiness probes configured
3. **CI-ready**: Playwright configured for CI (retries, artifacts, HTML report)
4. **Reproducibility**: `package-lock.json`, pinned versions

---

## 4. Weaknesses & Technical Debt

### ⚠️ Critical Issues

#### 1. **Dead Branch: `pdf-handler.js` UNUSED**
```javascript
// src/pdf-handler.js — imported but never called in main.js
export async function watermakPdf(file, options) { ... }
```
**Impact**: 
- 103 lines of dead code
- Confusion for future contributors
- Unnecessary maintenance of an inactive processing path

**Reality**: The app uses `PDF.js` → Canvas → `pdf-lib` to reconstruct the PDF. The `watermakPdf()` function that applies the watermark directly to the native PDF is never called.

**Solution**: 
- Remove `pdf-handler.js` OR
- Integrate its call in `renderPdfPreview()` / `handleDownload()` as a high-performance alternative

---

#### 2. **Typo in Function Name**
```javascript
// src/image-handler.js:7
export async function watermakImage(file, options) { // ❌ "watermak" instead of "watermark"
```
**Impact**: 
- Naming inconsistency throughout the codebase
- Potential confusion for new developers
- Bad practice to fix now before propagation

---

#### 3. **Strong Coupling Between UI and Rendering Logic**
```javascript
// src/main.js:342
function applyWatermarkToContext(ctx, width, height) {
  // Directly accesses state.options...
  const text = state.options.text;
  const fontSize = state.options.fontSize;
  // ...
}
```
**Problem**:
- Impure function depending on global state
- Hard to test unitarily without full `state` mock
- Violation of separation of concerns principle

**Alternative**: Pass options as explicit parameter:
```javascript
function applyWatermarkToContext(ctx, width, height, options) { ... }
```

---

#### 4. **Minimalist Error Handling**
```javascript
// src/main.js:243-246
catch (error) {
  console.error('Render error:', error);
  elements.previewArea.innerHTML = `<p class="error">❌ Error: ${error.message}</p>`;
}
```
**Missing**:
- No distinction between recoverable vs fatal errors
- No retry mechanism
- No structured logging (Sentry, LogRocket optional)
- No elegant fallback UI (e.g., "Try again in a moment")

---

#### 5. **Non-Optimized State Management**
```javascript
const state = {
  file: null,
  fileUrl: null,
  fileBlob: null,
  previewCanvas: null,
  previewCanvases: [],
  options: { ... }
};
```
**Problems**:
- Direct state mutation (no immutability guarantees)
- No schema validation (Zod, Yup, or even PropTypes)
- No memory leak detection (`fileUrl.revokeObjectURL` sometimes forgotten)

---

### ⚠️ Secondary Technical Debts

#### 6. **Service Worker Without Dynamic Versioning**
```javascript
// public/sw.js:2
const CACHE_NAME = 'watermark-v1'; // ❌ Hardcoded, never incremented
```
**Risk**: 
- Old caches never properly purged
- Updates may leave obsolete artifacts

**Solution**: Semantic versioning or timestamp in cache name.

---

#### 7. **Monolithic CSS**
```
styles/main.css — 808 lines, 16.6KB
```
**Problems**:
- No modularity (BEM is used but everything in one file)
- No production CSS purge (Tailwind would remove unused classes)
- No centralized CSS variables (some exist but scattered)

**Alternative**: 
- Split into modules: `header.css`, `dropzone.css`, `controls.css`, `workspace.css`
- Or migrate to Tailwind CSS (if acceptable for scope)

---

#### 8. **Unpinned Production Dependencies**
```json
// package.json
"pdf-lib": "^1.17.1",    // ⚠️ caret = can upgrade to minors automatically
"pdfjs-dist": "^6.2.108",
"vite": "^5.4.0"
```
**Risk**: A minor update could introduce breaking changes or vulnerabilities.

**Solution**: 
- Use `~` for patches only (e.g., `~1.17.1`)
- OR pin completely in CI (e.g., `1.17.1`) with manual review of updates

---

#### 9. **Obsolete Manual Test Script**
```
test-pdf.js — 140 lines of Node.js code with Playwright
```
**Problem**: This script seems to be a manual test prototype, redundant with structured Playwright tests in `tests/e2e/`.

**Action**: Remove or archive in `scripts/legacy/`.

---

#### 10. **Absence of TypeScript**
The project is entirely in vanilla JavaScript. While functional:
- No compile-time type checking
- Limited autocomplete in IDEs
- Higher risk of regressions during refactors

**Suggestion**: Gradual migration to TypeScript (optional depending on willingness to add complexity).

---

## 5. Known Vulnerabilities

### npm Audit (Development Only)
```
esbuild <=0.24.2 (via Vite)
- Severity: moderate
- GHSA-67mh-4wv8-2f99: "Dev server only"
- Production impact: ZERO
```
**Verdict**: No risk for production, as the vulnerability concerns only the Vite dev server.

---

## 6. Architectural Improvement Suggestions

### 🚀 High Priority (Immediate)

#### 1. **Remove or Activate `pdf-handler.js`**
- **Option A**: Remove the file (dead code cleanup)
- **Option B**: Reactivate as fast path:
  ```javascript
  // In handleDownload():
  const useNativePdf = true; // Feature flag
  if (useNativePdf && state.file.type === 'application/pdf') {
    blob = await watermakPdf(state.file, state.options);
  } else {
    blob = await canvasesToPdf(state.previewCanvases);
  }
  ```
  **Advantage**: Better rendering quality (vector text instead of raster JPEG).

---

#### 2. **Fix Typo `watermakImage` → `watermarkImage`**
```bash
# Rename function in all files
sed -i 's/watermakImage/watermarkImage/g' src/*.js
```

---

#### 3. **Add Schema Validation for `state.options`**
```javascript
// src/state.js (new file)
import { z } from 'zod';

export const WatermarkOptionsSchema = z.object({
  text: z.string().min(1).max(500),
  position: z.enum(['diagonal', 'center', 'bottom', 'tile']),
  opacity: z.number().min(5).max(100),
  fontSize: z.number().min(16).max(120),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  rotation: z.number().min(-90).max(90),
});

export const defaultOptions = WatermarkOptionsSchema.parse({
  text: 'Copy for verification only\n{date}',
  position: 'diagonal',
  opacity: 30,
  fontSize: 48,
  color: '#dc2626',
  rotation: -45,
});
```

---

### 🔄 Medium Priority (Short Term)

#### 4. **Refactor `applyWatermarkToContext` into Pure Function**
```javascript
// Before
function applyWatermarkToContext(ctx, width, height) {
  const text = state.options.text; // ❌ Impure
  // ...
}

// After
export function applyWatermarkToContext(ctx, width, height, options) {
  const text = options.text; // ✅ Pure, testable
  // ...
}

// In main.js
applyWatermarkToContext(ctx, canvas.width, canvas.height, state.options);
```

---

#### 5. **Implement Retry Mechanism & Error Boundaries**
```javascript
// src/utils/retry.js
export async function retryAsync(fn, { maxRetries = 3, delay = 1000 } = {}) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
  throw lastError;
}

// Usage
await retryAsync(() => renderPdfPreview(), { maxRetries: 2 });
```

---

#### 6. **Dynamically Version Service Worker**
```javascript
// public/sw.js
const CACHE_VERSION = 'v2'; // Increment on each deploy
const CACHE_NAME = `watermark-${CACHE_VERSION}`;
```
OR
```javascript
const CACHE_VERSION = __APP_VERSION__; // Injected by Vite via process.env.npm_package_version
```

---

#### 7. **Modularize CSS**
```
styles/
├── main.css              # Entry point, imports modules
├── base/
│   ├── _variables.css    # CSS Custom Properties
│   ├── _reset.css
│   └── _typography.css
├── components/
│   ├── _dropzone.css
│   ├── _controls.css
│   ├── _presets.css
│   └── _buttons.css
└── layout/
    ├── _header.css
    ├── _workspace.css
    └── _footer.css
```

---

### 🌱 Low Priority (Long Term)

#### 8. **Gradual Migration to TypeScript**
- Start with pure utilities (`src/utils/*.js`)
- Add JSDoc types in the meantime (TypeScript compatible without full conversion)
- Example:
  ```javascript
  /**
   * @typedef {Object} WatermarkOptions
   * @property {string} text
   * @property {'diagonal'|'center'|'bottom'|'tile'} position
   * @property {number} opacity
   */
  
  /**
   * @param {HTMLCanvasElement} ctx
   * @param {number} width
   * @param {number} height
   * @param {WatermarkOptions} options
   */
  export function applyWatermarkToContext(ctx, width, height, options) { ... }
  ```

---

#### 9. **Add Optional Monitoring (Privacy-Respecting)**
If metrics are needed:
- **Plausible Analytics**: Self-hosted, GDPR-compliant, zero cookies
- **Fathom Analytics**: Paid alternative, simple and privacy-first
- **Self-hosted Matomo**: Full control, open source

**Important**: Always explicit opt-in, never by default.

---

#### 10. **Feature Flags for A/B Testing**
```javascript
// src/features.js
export const FEATURES = {
  NATIVE_PDF_RENDERING: false, // Switch to watermakPdf()
  MULTI_LANGUAGE_UI: true,
  AUTO_SAVE_PRESETS: false,
};
```

---

## 7. Additional Security Recommendations

### CSP Headers (nginx.conf)
Add to `nginx.conf`:
```nginx
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' data: blob:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
" always;
```

---

### Additional Security Headers
```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

---

## 8. Quality Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **Test Coverage** | ~60% (estimated) | >80% | ⚠️ Needs improvement |
| **Cyclomatic Complexity** | Low (<10/function) | <15 | ✅ Good |
| **Technical Debt** | ~10 minor points | 0 | ⚠️ Correctable |
| **npm Vulnerabilities** | 2 (dev-only) | 0 | ✅ Acceptable |
| **Bundle Size** | ~500KB | <1MB | ✅ Excellent |
| **Lighthouse Score** | Not measured | >90 | ? To check |

---

## 9. Recommended Action Plan

### Week 1: Immediate Cleanup
- [ ] Remove `test-pdf.js` (obsolete)
- [ ] Fix typo `watermakImage` → `watermarkImage`
- [ ] Decide: remove `pdf-handler.js` or integrate it

### Week 2: Architectural Improvements
- [ ] Refactor `applyWatermarkToContext` into pure function
- [ ] Add schema validation for `state.options`
- [ ] Modularize CSS (split into modules)

### Week 3: Robustness
- [ ] Implement retry mechanism
- [ ] Improve error handling (retry UI, logging)
- [ ] Version Service Worker

### Week 4: Polish
- [ ] Add CSP headers in nginx
- [ ] Configure Lighthouse CI
- [ ] Update `SECURITY_AUDIT.md`

---

## 10. Conclusion

WaterMark is a **well-designed application** with a robust security philosophy ("privacy by design"). The absence of framework and network calls guarantees maximum privacy for users.

**Main areas for improvement**:
1. Eliminate dead code (`pdf-handler.js`)
2. Make code more testable (pure functions, dependency injection)
3. Strengthen robustness (retry, error boundaries)
4. Modernize infrastructure (SW versioning, CSS modularization)

**Final Recommendation**: The project is **PRODUCTION READY** with a **HIGH** confidence level. The suggested improvements are "nice-to-have" optimizations rather than critical fixes.

---

## Appendix: Useful Commands

```bash
# Production build
npm run build

# Preview build locally
npx serve dist

# Run E2E tests
npm test

# View test report
npm run test:report

# Docker build
docker-compose build

# Run in Docker
docker-compose up -d

# Security audit
npm audit

# Check bundle size
npx vite-bundle-visualizer
```

---

**End of Architectural Audit.**
