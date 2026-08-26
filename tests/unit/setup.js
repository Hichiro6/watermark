// Setup global pour les tests unitaires Vitest
// Polyfill localStorage si absent (jsdom peut ne pas l'exposer selon la version)
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
    key: (i) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  };
}

// Polyfill navigator.language si absent
if (!globalThis.navigator?.language) {
  Object.defineProperty(globalThis, 'navigator', {
    value: { language: 'en', userAgent: 'vitest' },
    writable: true,
  });
}
