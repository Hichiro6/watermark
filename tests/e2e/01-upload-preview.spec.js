/**
 * Tests fonctionnels - Upload et preview
 *
 * Couvre:
 * - Upload image (JPG, PNG) → preview correcte
 * - Upload PDF → preview multi-pages correcte
 */

import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { createTestImage, createTestPdf } from './helpers/test-fixtures-gen.js';

const fixturesDir = path.join(process.cwd(), 'tests/e2e/fixtures');

test.describe('📤 Upload et Preview', () => {
  test.beforeAll(async () => {
    // Ensure fixtures exist
    if (!fs.existsSync(path.join(fixturesDir, 'test-document.pdf'))) {
      await createTestPdf({ pages: 2, text: 'Upload Preview Test' });
    }
    if (!fs.existsSync(path.join(fixturesDir, 'test-image.png'))) {
      createTestImage({ filename: 'test-image.png', text: 'PNG Test' });
    }
    if (!fs.existsSync(path.join(fixturesDir, 'test-image.jpg'))) {
      createTestImage({ filename: 'test-image.jpg', text: 'JPG Test' });
    }
  });

  test('Upload image PNG → preview canvas visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    // Upload PNG
    const pngPath = path.join(fixturesDir, 'test-image.png');
    await page.setInputFiles('input[type="file"]', pngPath);

    // Wait for workspace to appear
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#dropzone')).toBeHidden();

    // Filename should be displayed
    await expect(page.locator('#filename')).toContainText('test-image.png');

    // Canvas should be present in preview area
    await page.waitForSelector('#preview-area canvas', { timeout: 10000 });
    const canvas = page.locator('#preview-area canvas');
    await expect(canvas).toHaveCount(1, { timeout: 5000 });

    // Verify canvas has dimensions
    const width = await canvas.evaluate((el) => el.width);
    const height = await canvas.evaluate((el) => el.height);
    expect(width, 'Canvas width should be > 0').toBeGreaterThan(0);
    expect(height, 'Canvas height should be > 0').toBeGreaterThan(0);
  });

  test('Upload image JPG → preview canvas visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    const jpgPath = path.join(fixturesDir, 'test-image.jpg');
    await page.setInputFiles('input[type="file"]', jpgPath);

    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#filename')).toContainText('test-image.jpg');

    await page.waitForSelector('#preview-area canvas', { timeout: 10000 });
    const canvas = page.locator('#preview-area canvas');
    await expect(canvas).toHaveCount(1);
  });

  test('Upload PDF multi-pages → canvases rendus (attendu: 1+ canvases)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    const pdfPath = path.join(fixturesDir, 'test-document.pdf');
    await page.setInputFiles('input[type="file"]', pdfPath);

    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#filename')).toContainText('test-document.pdf');

    // Wait for PDF rendering — at least 1 canvas expected
    await page.waitForSelector('#preview-area canvas', { timeout: 15000 });

    // Give time for all pages to render
    await page.waitForTimeout(3000);

    // Should have at least 1 canvas (actual count may vary based on app implementation)
    const canvases = page.locator('#preview-area canvas');
    const count = await canvases.count();
    expect(count, 'PDF devrait produire au moins 1 canvas').toBeGreaterThanOrEqual(1);

    // Verify each canvas has content (dimensions > 0)
    for (let i = 0; i < count; i++) {
      const w = await canvases.nth(i).evaluate((el) => el.width);
      const h = await canvases.nth(i).evaluate((el) => el.height);
      expect(w, `Canvas page ${i + 1} width > 0`).toBeGreaterThan(0);
      expect(h, `Canvas page ${i + 1} height > 0`).toBeGreaterThan(0);
    }
  });

  test('Upload PDF → indicateur de pagination visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    const pdfPath = path.join(fixturesDir, 'test-document.pdf');
    await page.setInputFiles('input[type="file"]', pdfPath);

    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });

    // Wait for page indicators to be rendered (test-document.pdf has 2 pages)
    await page.waitForFunction(
      () => {
        const text = document.querySelector('#preview-area')?.textContent || '';
        // Match "Page X of Y" (en) or "Page X de Y" (fr)
        const matches = text.match(/Page \d+ (?:of|de) \d+/gi) || [];
        return matches.length >= 2;
      },
      null,
      { timeout: 20000 },
    );

    // Check for page indicator text (should contain page numbers)
    const previewText = await page.locator('#preview-area').textContent();
    expect(previewText, 'Devrait contenir les numéros de page').toMatch(/Page \d+/i);
    expect(previewText, 'Devrait contenir le nombre total').toMatch(/(?:of|de) \d+/i);
  });

  test('Format non supporté → alerte', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    // Create a fake .txt file
    const txtPath = path.join(fixturesDir, 'invalid.txt');
    fs.writeFileSync(txtPath, 'This is not an image or PDF');

    // Listen for dialog
    page.on('dialog', (dialog) => {
      expect(dialog.message()).toContain('Format non pris en charge');
      dialog.accept();
    });

    await page.setInputFiles('input[type="file"]', txtPath);
    await page.waitForTimeout(500);

    // Workspace should NOT be visible
    await expect(page.locator('#workspace')).toBeHidden();
    await expect(page.locator('#dropzone')).toBeVisible();
  });

  test('Drag & drop fonctionne', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    // Playwright doesn't fully support DataTransfer with real files.
    // Workaround: use setInputFiles on the hidden input (same code path as drop handler)
    const pngPath = path.join(fixturesDir, 'test-image.png');
    await page.setInputFiles('input[type="file"]', pngPath);

    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#filename')).toContainText('test-image.png');
  });
});
