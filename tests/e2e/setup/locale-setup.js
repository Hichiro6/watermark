/**
 * Per-test locale injection for Playwright
 * Forces French locale in localStorage before each test page loads
 */
import { test as base } from '@playwright/test';

// Key must match src/i18n.js STORAGE_KEY
const LANG_STORAGE_KEY = 'watermark_lang';

// Extended test fixture: injects French locale before each test
export const test = base.extend({
  // Auto-injected page fixture override
  page: async ({ page }, use) => {
    // Inject localStorage before page loads
    await page.addInitScript(([{ key, value }]) => {
      window.localStorage.setItem(key, value);
    }, [{ key: LANG_STORAGE_KEY, value: 'fr' }]);
    
    await use(page);
  },
});

export { expect } from '@playwright/test';
