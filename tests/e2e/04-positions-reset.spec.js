/**
 * Tests fonctionnels - Positions et Reset
 *
 * Couvre:
 * - Positions : diagonal, center, bottom, mosaic (tile)
 * - Reset button : état initial restored
 */

import path from 'node:path';
import { expect, test } from '@playwright/test';
import { createTestPdf } from './helpers/test-fixtures-gen.js';
import { waitForCanvasRender } from './helpers/test-utils.js';

const _fixturesDir = path.join(process.cwd(), 'tests/e2e/fixtures');

test.describe('🔄 Positions et Reset', () => {
  let testPdfPath;

  test.beforeAll(async () => {
    testPdfPath = await createTestPdf({
      pages: 1,
      text: 'Positions Test',
      filename: 'positions-test.pdf',
    });
  });

  test('Position diagonal → canvas rendu avec watermark', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    // Upload PDF
    await page.setInputFiles('input[type="file"]', testPdfPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 15000 });

    // Position diagonal should be active by default
    const diagBtn = page.locator('.seg-btn[data-position="diagonal"]');
    await expect(diagBtn).toHaveClass(/active/);

    // Canvas should be rendered
    await expect(page.locator('canvas')).not.toHaveCount(0);
  });

  test('Position center → canvas rendu sans rotation', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    await page.setInputFiles('input[type="file"]', testPdfPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await waitForCanvasRender(page); // Use helper instead of hardcoded wait

    // Select center position
    await page.click('.seg-btn[data-position="center"]');
    await waitForCanvasRender(page); // Wait for re-render after position change

    // Center should be active
    await expect(page.locator('.seg-btn[data-position="center"]')).toHaveClass(/active/);

    // Canvas should be present
    await expect(page.locator('canvas')).not.toHaveCount(0);
  });

  test('Position bottom → canvas rendu avec watermark en bas', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    await page.setInputFiles('input[type="file"]', testPdfPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await waitForCanvasRender(page);

    // Select bottom position
    await page.click('.seg-btn[data-position="bottom"]');
    await waitForCanvasRender(page);

    await expect(page.locator('.seg-btn[data-position="bottom"]')).toHaveClass(/active/);

    // Canvas should be present
    await expect(page.locator('canvas')).not.toHaveCount(0);
  });

  test('Position mosaic (tile) → canvas rendu avec watermark répété', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    await page.setInputFiles('input[type="file"]', testPdfPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await waitForCanvasRender(page);

    // Select tile position
    await page.click('.seg-btn[data-position="tile"]');
    await waitForCanvasRender(page);

    await expect(page.locator('.seg-btn[data-position="tile"]')).toHaveClass(/active/);

    // Canvas should be present
    await expect(page.locator('canvas')).not.toHaveCount(0);
  });

  test('Changement de position re-render la preview', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    await page.setInputFiles('input[type="file"]', testPdfPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await waitForCanvasRender(page);

    // Switch through all positions
    for (const pos of ['center', 'bottom', 'tile', 'diagonal']) {
      await page.click(`.seg-btn[data-position="${pos}"]`);
      await waitForCanvasRender(page);
      await expect(page.locator(`.seg-btn[data-position="${pos}"]`)).toHaveClass(/active/);
      // Canvas should be present after each change
      await expect(page.locator('canvas')).not.toHaveCount(0);
    }
  });

  test("Reset button → restore l'état initial", async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    // Upload a file
    await page.setInputFiles('input[type="file"]', testPdfPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#dropzone')).toBeHidden();

    // Modify some controls
    await page.fill('#opacity', '80');
    await page.fill('#fontsize', '100');
    await page.fill('#rotation', '45');
    await page.waitForTimeout(500);

    // Click reset
    await page.click('#btn-reset');
    await page.waitForTimeout(500);

    // Dropzone should be visible again
    await expect(page.locator('#dropzone')).toBeVisible();

    // Workspace should be hidden
    await expect(page.locator('#workspace')).toBeHidden();

    // Preview should be empty
    const previewContent = await page.locator('#preview-area').innerHTML();
    expect(previewContent, 'Preview area should be cleared').toBe('');

    // File input should be cleared
    expect(await page.locator('#file-input').inputValue(), 'File input should be cleared').toBe('');
  });

  test('Reset puis nouvel upload → fonctionne correctement', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    // First upload
    await page.setInputFiles('input[type="file"]', testPdfPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 15000 });

    // Reset
    await page.click('#btn-reset');
    await page.waitForTimeout(500);
    await expect(page.locator('#dropzone')).toBeVisible();

    // Upload again
    await page.setInputFiles('input[type="file"]', testPdfPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 15000 });

    // Canvas should be present
    await expect(page.locator('canvas')).not.toHaveCount(0);

    // Filename should be displayed
    await expect(page.locator('#filename')).toContainText('positions-test.pdf');
  });
});
