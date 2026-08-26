# 🏛️ Audit Architectural — WaterMark PWA

**Date de l'audit** : 2026-08-26  
**Version du projet** : 1.0.0  
**Développeur** : Hichiro  
**Licence** : CC-BY-NC-ND-4.0  

---

## 📋 Résumé Exécutif

WaterMark est une **PWA (Progressive Web App)** 100% client-side conçue pour ajouter des filigranes de sécurité sur des documents administratifs (PDF et images). L'architecture adopte une approche **"zero-trust data"** : aucun document ne quitte le navigateur de l'utilisateur.

**Note globale** : ⭐⭐⭐⭐☆ (4/5)  
**Sécurité** : A- (Excellent)  
**Maintainabilité** : B+ (Bon)  
**Performance** : A (Excellente)  

---

## 1. Structure du Projet

```
/
├── public/
│   ├── favicon.svg           # Icône de l'application
│   ├── manifest.json         # Manifest PWA
│   └── sw.js                 # Service Worker (cache offline)
├── src/
│   ├── main.js               # Point d'entrée, logique UI principale
│   ├── i18n.js               # Système de traduction (EN, FR, DE, ES, PT)
│   ├── image-handler.js      # Traitement des images via Canvas API
│   ├── pdf-handler.js        # Traitement PDF via pdf-lib (NON UTILISÉ en prod)
│   └── presets.js            # Presets de filigrane prédéfinis
├── styles/
│   └── main.css              # Styles globaux (808 lignes, CSS pur)
├── tests/e2e/
│   ├── 01-upload-preview.spec.js
│   ├── 02-ui-controls.spec.js
│   ├── 03-download.spec.js
│   ├── 04-positions-reset.spec.js
│   ├── 05-non-regression.spec.js
│   ├── 06-edge-cases.spec.js
│   ├── fixtures/             # Fichiers de test (PDF, images)
│   └── helpers/              # Utils de test
├── index.html                # Template HTML unique (SPA)
├── vite.config.js            # Configuration Vite
├── playwright.config.js      # Configuration Playwright
├── package.json              # Dépendances et scripts
├── Dockerfile                # Build multi-stage
├── docker-compose.yml        # Orchestration Docker
├── nginx.conf                # Configuration serveur production
├── SECURITY_AUDIT.md         # Rapport de sécurité précédent
├── README.md                 # Documentation utilisateur
└── test-pdf.js               # Script de test manuel (déprécié)
```

**Statistiques** :
- **47 fichiers source** (hors node_modules, .git, dist, artifacts de test)
- **~17K lignes de code** (CSS inclus)
- **6 tests E2E** couvrant les flux critiques
- **0 dépendance backend** — Purement client-side

---

## 2. Technologies Utilisées

### Frontend Core
| Technologie | Version | Usage |
|-------------|---------|-------|
| **Vite** | ^5.4.0 | Build tool, dev server |
| **Vanilla JS** | ES Modules | Logique applicative (0 framework) |
| **Canvas API** | Native | Rendu des filigranes sur images/PDF |
| **PDF.js** | ^6.2.108 | Parsing et rendu PDF (Mozilla) |
| **pdf-lib** | ^1.17.1 | Création PDF (utilisé dans `canvasesToPdf`) |

### Infrastructure & Déploiement
| Outil | Usage |
|-------|-------|
| **Docker** | Build multi-stage, déploiement |
| **nginx** | Reverse proxy, serve statique, caching |
| **Playwright** | Tests E2E automatisés |

### Internationalisation
- **5 langues supportées** : EN (principal), FR, DE, ES, PT
- **Traductions natives** : Pas de librairie externe (i18n.js maison, ~17K octets)
- **Auto-detection** : Détection automatique de la langue du navigateur

### PWA Capabilities
- **Service Worker** : Cache-first strategy, offline support
- **Manifest** : Installation sur device, icônes, theme color
- **Responsive** : Mobile-first CSS, touch targets ≥ 44px

---

## 3. Points Forts Architecturaux

### ✅ Sécurité & Confidentialité (Grade A-)
1. **Zero data exfiltration** : Aucun appel réseau (`fetch`, `XMLHttpRequest`, `WebSocket`) dans le code source
2. **Traitement in-memory** : Documents jamais écrits sur disque, uniquement dans la RAM du navigateur
3. **Sanitization stricte** : Whitelist de types MIME, noms de fichiers nettoyés avant téléchargement
4. **PDF.js hardened** : `isEvalSupported: false` désactive l'exécution de JS malveillant dans les PDF
5. **Aucune clé API, secret ou telemetry** dans le code

### ✅ Performance (Grade A)
1. **Build ultra-léger** : Vite + no framework ≈ <500KB bundle total
2. **Rendu incrémental** : Debounce 300ms sur les changements d'options
3. **Pagination intelligente** : Yield au navigateur toutes les 5 pages PDF
4. **Cache HTTP agressif** : Immutable headers sur les assets statiques (1 an)
5. **Gzip activé** : Compression texte/CSS/JS côté nginx

### ✅ Qualité du Code (Grade B+)
1. **Architecture modulaire** : Separation claire entre handlers (image, pdf), i18n, presets
2. **Tests E2E complets** : 6 scénarios couvrant upload, preview, download, edge cases
3. **Documentation riche** : `SECURITY_AUDIT.md`, `README.md`, commentaires JSDoc
4. **A11y intégrée** : `prefers-reduced-motion`, `prefers-contrast`, aria-labels implicites

### ✅ DevOps & Maintenable (Grade B+)
1. **Docker multi-stage** : Build isolé, image finale nginx alpine (~25MB)
2. **Health checks** : Liveness/readiness probes configurés
3. **CI-ready** : Playwright configuré pour CI (retries, artifacts, HTML report)
4. **Reproducibilité** : `package-lock.json`, versions pinned

---

## 4. Points Faibles & Dette Technique

### ⚠️ Problèmes Critiques

#### 1. **Branche mort-née : `pdf-handler.js` NON UTILISÉE**
```javascript
// src/pdf-handler.js — importé mais jamais appelé dans main.js
export async function watermakPdf(file, options) { ... }
```
**Impact** : 
- 103 lignes de code mort (dead code)
- Confusion pour les contributeurs futurs
- Maintenance inutile d'une voie de traitement inactive

**Réalité** : L'application utilise `PDF.js` → Canvas → `pdf-lib` pour reconstruire le PDF. La fonction `watermakPdf()` qui applique directement le filigrane sur le PDF natif n'est jamais appelée.

**Solution** : 
- Supprimer `pdf-handler.js` OU
- Intégrer son appel dans `renderPdfPreview()` / `handleDownload()` comme voie alternative performante

---

#### 2. **Typo dans le nom de fonction**
```javascript
// src/image-handler.js:7
export async function watermakImage(file, options) { // ❌ "watermak" au lieu de "watermark"
```
**Impact** : 
- Incohérence de naming dans toute la codebase
- Risque de confusion pour les nouveaux développeurs
- Mauvaise pratique à corriger maintenant avant propagation

---

#### 3. **Couplage fort entre UI et logique de rendu**
```javascript
// src/main.js:342
function applyWatermarkToContext(ctx, width, height) {
  // Accède directement à state.options...
  const text = state.options.text;
  const fontSize = state.options.fontSize;
  // ...
}
```
**Problème** :
- Fonction impure qui dépend de l'état global
- Difficile à tester unitairement sans mock complet de `state`
- Violation du principe de séparation des concerns

**Alternative** : Passer les options en paramètre explicite :
```javascript
function applyWatermarkToContext(ctx, width, height, options) { ... }
```

---

#### 4. **Gestion d'erreurs minimaliste**
```javascript
// src/main.js:243-246
catch (error) {
  console.error('Erreur de rendu:', error);
  elements.previewArea.innerHTML = `<p class="error">❌ Erreur: ${error.message}</p>`;
}
```
**Manques** :
- Pas de distinction entre erreurs récupérables vs fatales
- Pas de retry mechanism
- Pas de logging structuré ( Sentry, LogRocket optionnel )
- Pas de fallback UI élégant (ex: "Réessayez dans quelques instants")

---

#### 5. **State management non-optimisé**
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
**Problèmes** :
- Mutation directe de l'état (pas de immutability guarantees)
- Pas de validation de schéma (Zod, Yup, ou même PropTypes)
- Pas de détection de fuite mémoire (`fileUrl.revokeObjectURL` parfois oublié)

---

### ⚠️ Dettes Techniques Secondaires

#### 6. **Service Worker sans versioning dynamique**
```javascript
// public/sw.js:2
const CACHE_NAME = 'watermark-v1'; // ❌ Hardcodé, jamais incrémenté
```
**Risque** : 
- Les anciens caches ne sont jamais purgés correctement
- Les mises à jour peuvent laisser des artefacts obsolètes

**Solution** : Versionnement sémantique ou timestamp dans le nom du cache.

---

#### 7. **CSS monolithique**
```
styles/main.css — 808 lignes, 16.6KB
```
**Problèmes** :
- Pas de modularisation (BEM est utilisé mais tout dans un seul fichier)
- Pas de purge CSS en production (Tailwind purgerait les classes inutilisées)
- Pas de CSS variables centralisées (quelques variables existent mais dispersion)

**Alternative** : 
- Découper en modules : `header.css`, `dropzone.css`, `controls.css`, `workspace.css`
- Ou migrer vers Tailwind CSS (si acceptable pour le scope)

---

#### 8. **Dépendances non-pinnées en production**
```json
// package.json
"pdf-lib": "^1.17.1",    // ⚠️ caret = peut upgrader aux mineures automatiquement
"pdfjs-dist": "^6.2.108",
"vite": "^5.4.0"
```
**Risque** : Une mise à jour mineure pourrait introduire des breaking changes ou vulnérabilités.

**Solution** : 
- Utiliser `~` pour les patchs seulement (ex: `~1.17.1`)
- OU pincer complètement en CI (ex: `1.17.1`) avec revue manuelle des mises à jour

---

#### 9. **Script de test manuel obsolète**
```
test-pdf.js — 140 lignes de code Node.js avec Playwright
```
**Problème** : Ce script semble être un prototype de test manuel, redondant avec les tests Playwright structurés dans `tests/e2e/`.

**Action** : Supprimer ou archiver dans `scripts/legacy/`.

---

#### 10. **Absence de TypeScript**
Le projet est entièrement en JavaScript vanilla. Bien que fonctionnel :
- Pas de type checking à la compilation
- Autocompletion limitée dans les IDE
- Risque accru de régressions lors des refactors

**Suggestion** : Migration progressive vers TypeScript (optionnelle selon la volonté de complexité ajoutée).

---

## 5. Vulnérabilités Connues

### npm Audit (Développement Seulement)
```
esbuild <=0.24.2 (via Vite)
- Severity: moderate
- GHSA-67mh-4wv8-2f99 : "Dev server only"
- Impact production: ZERO
```
**Verdict** : Sans risque pour la production, car la vulnérabilité concerne uniquement le dev server Vite.

---

## 6. Suggestions d'Amélioration Architecturale

### 🚀 Priorité Haute (Immédiat)

#### 1. **Supprimer ou Activer `pdf-handler.js`**
- **Option A** : Supprimer le fichier (dead code cleanup)
- **Option B** : Réactiver comme voie rapide :
  ```javascript
  // Dans handleDownload():
  const useNativePdf = true; // Feature flag
  if (useNativePdf && state.file.type === 'application/pdf') {
    blob = await watermakPdf(state.file, state.options);
  } else {
    blob = await canvasesToPdf(state.previewCanvases);
  }
  ```
  **Avantage** : Meilleure qualité de rendu (texte vectoriel au lieu de raster JPEG).

---

#### 2. **Corriger le Typo `watermakImage` → `watermarkImage`**
```bash
# Renommer la fonction dans tous les fichiers
sed -i 's/watermakImage/watermarkImage/g' src/*.js
```

---

#### 3. **Ajouter Validation de Schéma pour `state.options`**
```javascript
// src/state.js (nouveau fichier)
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
  text: 'Copie pour vérification uniquement\n{date}',
  position: 'diagonal',
  opacity: 30,
  fontSize: 48,
  color: '#dc2626',
  rotation: -45,
});
```

---

### 🔄 Priorité Moyenne (Court Terme)

#### 4. **Refactoriser `applyWatermarkToContext` en Fonction Pure**
```javascript
// Avant
function applyWatermarkToContext(ctx, width, height) {
  const text = state.options.text; // ❌ Impure
  // ...
}

// Après
export function applyWatermarkToContext(ctx, width, height, options) {
  const text = options.text; // ✅ Pure, testable
  // ...
}

// Dans main.js
applyWatermarkToContext(ctx, canvas.width, canvas.height, state.options);
```

---

#### 5. **Implémenter Retry Mechanism & Error Boundaries**
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

// Utilisation
await retryAsync(() => renderPdfPreview(), { maxRetries: 2 });
```

---

#### 6. **Versionner le Service Worker Dynamiquement**
```javascript
// public/sw.js
const CACHE_VERSION = 'v2'; // Incrémenter à chaque deploy
const CACHE_NAME = `watermark-${CACHE_VERSION}`;
```
OU
```javascript
const CACHE_VERSION = __APP_VERSION__; // Injecté par Vite via process.env.npm_package_version
```

---

#### 7. **Modulariser le CSS**
```
styles/
├── main.css              # Entry point, imports les modules
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

### 🌱 Priorité Basse (Long Terme)

#### 8. **Migration Progressive vers TypeScript**
- Commencer par les utilitaires purs (`src/utils/*.js`)
- Ajouter JSDoc types en attendant (compatible TypeScript sans conversion complète)
- Exemple :
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

#### 9. **Ajouter Monitoring Optionnel (Respectueux de la vie privée)**
Si besoin de métriques :
- **Plausible Analytics** : Auto-hébergé, respect RGPD, zero cookies
- **Fathom Analytics** : Alternative payante, simple et privacy-first
- **Self-hosted Matomo** : Full control, open source

**Important** : Toujours opt-in explicite, jamais par défaut.

---

#### 10. **Feature Flags pour Tests A/B**
```javascript
// src/features.js
export const FEATURES = {
  NATIVE_PDF_RENDERING: false, // Bascule vers watermakPdf()
  MULTI_LANGUAGE_UI: true,
  AUTO_SAVE_PRESETS: false,
};
```

---

## 7. Recommandations de Sécurité Additionnelles

### CSP Headers (nginx.conf)
Ajouter dans `nginx.conf` :
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

### Security Headers Compléments
```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

---

## 8. Métriques de Qualité

| Métrique | Valeur | Cible | Statut |
|----------|--------|-------|--------|
| **Couverture de tests** | ~60% (estimé) | >80% | ⚠️ À améliorer |
| **Complexité cyclomatique** | Faible (<10/fonction) | <15 | ✅ Bon |
| **Dettes techniques** | ~10 points mineurs | 0 | ⚠️ Correctable |
| **Vulnérabilités npm** | 2 (dev-only) | 0 | ✅ Acceptable |
| **Bundle size** | ~500KB | <1MB | ✅ Excellent |
| **Lighthouse Score** | Non mesuré | >90 | ? À checker |

---

## 9. Plan d'Action Recommandé

### Semaine 1 : Nettoyage Immédiat
- [ ] Supprimer `test-pdf.js` (obsolète)
- [ ] Corriger typo `watermakImage` → `watermarkImage`
- [ ] Décider : supprimer `pdf-handler.js` ou l'intégrer

### Semaine 2 : Améliorations Architecturales
- [ ] Refactor `applyWatermarkToContext` en fonction pure
- [ ] Ajouter validation schema pour `state.options`
- [ ] Modulariser CSS (découpage en modules)

### Semaine 3 : Robustesse
- [ ] Implémenter retry mechanism
- [ ] Améliorer gestion d'erreurs (retry UI, logging)
- [ ] Versionner Service Worker

### Semaine 4 : Polish
- [ ] Ajouter CSP headers dans nginx
- [ ] Configurer Lighthouse CI
- [ ] Mettre à jour `SECURITY_AUDIT.md`

---

## 10. Conclusion

WaterMark est une **application bien conçue** avec une philosophie de sécurité robuste ("privacy by design"). L'absence de framework et d'appels réseau garantit une confidentialité maximale pour les utilisateurs.

**Les principaux axes d'amélioration** sont :
1. Éliminer le dead code (`pdf-handler.js`)
2. Rendre le code plus testable (fonctions pures, injection de dépendances)
3. Renforcer la robustesse (retry, error boundaries)
4. Moderniser l'infrastructure (versioning SW, modularisation CSS)

**Recommandation finale** : Le projet est **PRÊT POUR LA PRODUCTION** avec un niveau de confiance **ÉLEVÉ**. Les améliorations suggérées sont des optimisations "nice-to-have" plutôt que des correctifs critiques.

---

## Annexe : Commandes Utiles

```bash
# Build production
npm run build

# Preview build localement
npx serve dist

# Lancer tests E2E
npm test

# Voir rapport de test
npm run test:report

# Build Docker
docker-compose build

# Lancer en Docker
docker-compose up -d

# Audit sécurité
npm audit

# Vérifier bundle size
npx vite-bundle-visualizer
```

---

**Fin de l'audit architectural.**
