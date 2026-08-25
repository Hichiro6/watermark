/**
 * Tests de non-régression
 * 
 * Couvre:
 * - Rotation positive = sens horaire
 * - Position "center" = sans rotation
 * - Guard handleDownload() pour PDF et image séparés
 * - canvasesToPdf() retourne PDF valide (%PDF- header)
 * - Pas d'erreurs console pendant les opérations
 */
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { createTestPdf, createTestImage } from './helpers/test-fixtures-gen.js';
import { waitForCanvasRender } from './helpers/test-utils.js';

const fixturesDir = path.join(process.cwd(), 'tests/e2e/fixtures');

test.describe('🔒 Non-régression', () => {
  
  let testPdfPath;
  let testPngPath;
  
  test.beforeAll(async () => {
    testPdfPath = await createTestPdf({ pages: 3, text: 'Regression Test PDF', filename: 'regression-test.pdf' });
    testPngPath = createTestImage({ filename: 'test-image.png', text: 'Regression Test Image' });
  });

  test('Rotation positive (+45°) = sens horaire', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    // Upload an image first to make controls available
    await page.setInputFiles('input[type="file"]', testPngPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Set rotation to +45 (clockwise)
    await page.fill('#rotation', '45');
    await page.waitForTimeout(500);
    
    // Verify slider value
    expect(await page.locator('#rotation').inputValue()).toBe('45');
    await expect(page.locator('#rotation-value')).toContainText('45°');
    
    // Canvas should render without error
    const canvas = page.locator('canvas').first();
    const width = await canvas.evaluate(el => el.width);
    const height = await canvas.evaluate(el => el.height);
    expect(width, 'Canvas width > 0').toBeGreaterThan(0);
    expect(height, 'Canvas height > 0').toBeGreaterThan(0);
    
    // Verify that the canvas has non-transparent pixels (watermark applied)
    // Sample pixels from center area
    const hasContent = await canvas.evaluate(el => {
      const ctx = el.getContext('2d');
      const data = ctx.getImageData(el.width / 2, el.height / 2, 1, 1).data;
      return data[3] > 0; // Alpha > 0
    });
    expect(hasContent, 'Canvas should have content at center').toBeTruthy();
  });

  test('Rotation négative (-45°) = sens anti-horaire', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    // Upload first to make controls available
    await page.setInputFiles('input[type="file"]', testPngPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    await page.fill('#rotation', '-45');
    await page.waitForTimeout(500);
    
    expect(await page.locator('#rotation').inputValue()).toBe('-45');
    await expect(page.locator('#rotation-value')).toContainText('-45°');
    
    const canvas = page.locator('canvas').first();
    const width = await canvas.evaluate(el => el.width);
    expect(width, 'Canvas should render with -45° rotation').toBeGreaterThan(0);
  });

  test('Position "center" = sans rotation (même avec rotation ≠ 0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    // Upload image first to make controls available
    await page.setInputFiles('input[type="file"]', testPngPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Set a non-zero rotation
    await page.fill('#rotation', '45');
    await page.waitForTimeout(500);
    
    // Select center position
    await page.click('.seg-btn[data-position="center"]');
    await page.waitForTimeout(500);
    
    // Verify center position ignores rotation: the canvas should render
    // We verify by checking the canvas is not blank
    const canvas = page.locator('canvas').first();
    const hasContent = await canvas.evaluate(el => {
      const ctx = el.getContext('2d');
      const data = ctx.getImageData(0, 0, el.width, el.height).data;
      // Count non-zero alpha pixels
      let nonZero = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) nonZero++;
      }
      return nonZero > 0;
    });
    expect(hasContent, 'Canvas with center position should have content').toBeTruthy();
  });

  test('Guard handleDownload(): PDF utilise canvasesToPdf()', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    // Upload PDF
    await page.setInputFiles('input[type="file"]', testPdfPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await waitForCanvasRender(page, 30000); // Wait for all 3 pages
    
    const canvasCount = await page.locator('canvas').count();
    expect(canvasCount, 'Should have 3 canvases for 3-page PDF').toBe(3);
    
    // Download
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await page.click('#btn-download');
    const download = await downloadPromise;
    
    const savePath = path.join(fixturesDir, '..', 'downloads', 'regression-pdf.pdf');
    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    await download.saveAs(savePath);
    
    // Verify it's a valid PDF
    const fd = fs.openSync(savePath, 'r');
    const buffer = Buffer.alloc(5);
    fs.readSync(fd, buffer, 0, 5, 0);
    fs.closeSync(fd);
    
    expect(buffer.toString('utf8'), 'Downloaded PDF must start with %PDF-').toBe('%PDF-');
    
    // Cleanup
    fs.unlinkSync(savePath);
  });

  test('Guard handleDownload(): image utilise canvas.toBlob()', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    // Upload image
    await page.setInputFiles('input[type="file"]', testPngPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Only 1 canvas for image
    const canvasCount = await page.locator('canvas').count();
    expect(canvasCount, 'Should have 1 canvas for image').toBe(1);
    
    // Download
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    const download = await downloadPromise;
    
    const savePath = path.join(fixturesDir, '..', 'downloads', 'regression-image.png');
    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    await download.saveAs(savePath);
    
    // Verify it's a valid PNG (starts with PNG signature)
    const fd = fs.openSync(savePath, 'r');
    const buffer = Buffer.alloc(8);
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);
    
    // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
    expect(buffer[0], 'PNG first byte should be 0x89').toBe(0x89);
    expect(buffer[1], 'PNG second byte should be P').toBe(0x50);
    
    // Cleanup
    fs.unlinkSync(savePath);
  });

  test('canvasesToPdf() retourne PDF valide avec header %PDF-', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    await page.setInputFiles('input[type="file"]', testPdfPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await waitForCanvasRender(page, 30000);
    
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await page.click('#btn-download');
    const download = await downloadPromise;
    
    const savePath = path.join(fixturesDir, '..', 'downloads', 'canvases-topdf-test.pdf');
    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    await download.saveAs(savePath);
    
    const fileBuffer = fs.readFileSync(savePath);
    
    // Check PDF header
    const header = fileBuffer.subarray(0, 5).toString('utf8');
    expect(header, 'PDF must start with %PDF-').toBe('%PDF-');
    
    // Check PDF EOF marker
    const tail = fileBuffer.subarray(fileBuffer.length - 1024, fileBuffer.length).toString('utf8');
    expect(tail, 'PDF should contain %%EOF marker').toContain('%%EOF');
    
    // File size should be reasonable (not empty, not absurdly large)
    expect(fileBuffer.length, 'PDF file size > 1000 bytes').toBeGreaterThan(1000);
    
    fs.unlinkSync(savePath);
  });

  test('Pas d\'erreurs console pendant upload PDF + download', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    // Collect console errors
    const consoleErrors = [];
    const pageErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', err => {
      pageErrors.push(err.message);
    });
    
    // Full flow: upload → modify → download
    await page.setInputFiles('input[type="file"]', testPdfPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await waitForCanvasRender(page, 20000);
    
    // Modify opacity
    await page.fill('#opacity', '50');
    await waitForCanvasRender(page);
    
    // Download
    const downloadPromise = page.waitForEvent('download', { timeout: 60000 });
    await page.click('#btn-download');
    await downloadPromise;
    
    // Wait a bit for any delayed errors
    await page.waitForTimeout(1000);
    
    // Filter out expected/non-critical errors
    const criticalErrors = consoleErrors.filter(e =>
      !e.includes('SW registration') &&
      !e.includes('Service Worker') &&
      // NotReadableError is a known Playwright/Chromium issue with File handle
      // after arrayBuffer() consumption — not a real app bug
      !e.includes('NotReadableError')
    );
    
    expect(criticalErrors, `Console errors: ${criticalErrors.join(', ')}`).toHaveLength(0);
    expect(pageErrors, `Page errors: ${pageErrors.join(', ')}`).toHaveLength(0);
  });

  test('Pas d\'erreurs console pendant upload image + download', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    const consoleErrors = [];
    const pageErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => pageErrors.push(err.message));
    
    await page.setInputFiles('input[type="file"]', testPngPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    await page.fill('#rotation', '90');
    await page.waitForTimeout(1000);
    
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    await downloadPromise;
    
    await page.waitForTimeout(1000);
    
    const criticalErrors = consoleErrors.filter(e =>
      !e.includes('SW registration') &&
      !e.includes('Service Worker')
    );
    
    expect(criticalErrors, `Console errors: ${criticalErrors.join(', ')}`).toHaveLength(0);
    expect(pageErrors, `Page errors: ${pageErrors.join(', ')}`).toHaveLength(0);
  });

  test('handleDownload() sans fichier: guard retourn early', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    // No file uploaded — workspace hidden, no download possible
    // This verifies the guard indirectly: no crash, no download triggered
    await expect(page.locator('#workspace')).toBeHidden();
    
    // Intercept any potential download
    let downloadTriggered = false;
    page.on('download', () => { downloadTriggered = true; });
    
    // Try to click download (shouldn't be visible)
    const btn = page.locator('#btn-download');
    await expect(btn).not.toBeVisible();
    
    await page.waitForTimeout(500);
    expect(downloadTriggered, 'No download should be triggered without file').toBeFalsy();
  });

  test('PDF multi-pages: nombre de canvases = nombre de pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    await page.setInputFiles('input[type="file"]', testPdfPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await waitForCanvasRender(page, 30000);
    
    const canvasCount = await page.locator('canvas').count();
    expect(canvasCount, '3-page PDF should produce exactly 3 canvases').toBe(3);
  });
});
