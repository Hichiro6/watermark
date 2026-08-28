/**
 * Test utilities for WaterMark E2E tests
 * Fournit un helper commun pour uploader un fichier de test
 * et attendre que le workspace devienne visible.
 */

import path from 'node:path';

const fixturesDir = path.join(process.cwd(), 'tests/e2e/fixtures');

/**
 * Upload a test PDF (or image) and wait for workspace to appear.
 * @param {import('@playwright/test').Page} page
 * @param {string} filename - fixture filename (default: test-document.pdf)
 * @returns {Promise<{filename: string}>}
 */
export async function uploadTestFile(page, filename = 'test-document.pdf') {
  await page.goto('/');

  // Wait for dropzone to be visible (initial state)
  await page.waitForSelector('#dropzone', { timeout: 10000 });

  const filePath = path.join(fixturesDir, filename);
  await page.setInputFiles('input[type="file"]', filePath);

  // Wait for workspace to appear
  await page.waitForSelector('#workspace:not([hidden])', { timeout: 10000 });

  // Wait for canvas to render (especially important for PDFs with multiple pages)
  await waitForCanvasRender(page);

  return {
    filename: path.basename(filename),
  };
}

/**
 * Wait for canvas to render after any change (position, opacity, rotation, etc.)
 * Waits for at least one canvas to be present, then for the count to stabilize.
 * @param {import('@playwright/test').Page} page
 * @param {number} timeout - timeout in ms (default: 15000)
 */
export async function waitForCanvasRender(page, timeout = 15000) {
  // Wait for debounce + render cycle to start — renderPreview() clears
  // existing canvases (shows spinner). We wait briefly for canvases to
  // disappear, indicating the re-render has begun.
  // The app uses a 300ms debounce, so we give it 500ms to kick in.
  try {
    await page.waitForFunction(() => document.querySelectorAll('canvas').length === 0, null, {
      timeout: 500,
    });
  } catch {
    // Canvases didn't disappear — either no re-render was triggered,
    // or the render was instant. Continue to wait for canvases to exist.
  }

  // Wait for at least one canvas to be present
  await page.waitForFunction(() => document.querySelectorAll('canvas').length > 0, null, {
    timeout,
  });

  // Wait for canvas count to stabilize (handles multi-page PDFs)
  await page.waitForFunction(
    () => {
      const count = document.querySelectorAll('canvas').length;
      return new Promise((resolve) => {
        const prev = count;
        setTimeout(() => {
          resolve(document.querySelectorAll('canvas').length === prev);
        }, 300);
      });
    },
    null,
    { timeout },
  );
}

/**
 * Get a fixture file path
 */
export function getFixturePath(filename) {
  return path.join(fixturesDir, filename);
}
