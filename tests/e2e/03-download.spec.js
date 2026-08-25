/**
 * Tests fonctionnels - Téléchargement
 * 
 * Couvre:
 * - Téléchargement image → copie conforme
 * - Téléchargement PDF → copie conforme (header %PDF-)
 */
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { createTestPdf, createTestImage } from './helpers/test-fixtures-gen.js';
import { waitForCanvasRender } from './helpers/test-utils.js';

const fixturesDir = path.join(process.cwd(), 'tests/e2e/fixtures');
const downloadDir = path.join(process.cwd(), 'tests/e2e/downloads');

test.describe('⬇️ Téléchargement', () => {
  
  let testPdfPath;
  let testPngPath;
  
  test.beforeAll(async () => {
    fs.mkdirSync(downloadDir, { recursive: true });
    fs.mkdirSync(fixturesDir, { recursive: true });
    
    testPdfPath = await createTestPdf({ pages: 2, text: 'Download PDF Test', filename: 'download-test.pdf' });
    testPngPath = createTestImage({ filename: 'test-image.png', text: 'Download Image Test' });
  });
  
  test.afterEach(async () => {
    // Clean downloads
    try {
      const files = fs.readdirSync(downloadDir);
      for (const f of files) {
        fs.unlinkSync(path.join(downloadDir, f));
      }
    } catch {}
  });

  test('Téléchargement image → fichier PNG généré', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    // Upload image
    await page.setInputFiles('input[type="file"]', testPngPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Click download
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    const download = await downloadPromise;
    
    // Save and verify
    const savePath = path.join(downloadDir, 'downloaded-image.png');
    await download.saveAs(savePath);
    
    expect(fs.existsSync(savePath), 'Downloaded file should exist').toBeTruthy();
    
    const stats = fs.statSync(savePath);
    expect(stats.size, 'Downloaded file size > 0').toBeGreaterThan(0);
    
    // Filename should end with _watermarked.png
    const filename = download.suggestedFilename();
    expect(filename, 'Filename should contain _watermarked').toContain('_watermarked');
    expect(filename, 'Filename should end with .png').toMatch(/\.png$/);
  });

  test('Téléchargement PDF → fichier PDF valide (header %PDF-)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    // Upload PDF
    await page.setInputFiles('input[type="file"]', testPdfPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 15000 });
    
    // Wait for all canvases (2 pages)
    await page.waitForTimeout(3000);
    
    // Click download
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await page.click('#btn-download');
    const download = await downloadPromise;
    
    // Save and verify
    const savePath = path.join(downloadDir, 'downloaded-document.pdf');
    await download.saveAs(savePath);
    
    expect(fs.existsSync(savePath), 'Downloaded PDF should exist').toBeTruthy();
    
    const stats = fs.statSync(savePath);
    expect(stats.size, 'Downloaded PDF size > 0').toBeGreaterThan(100);
    
    // Check PDF header
    const fd = fs.openSync(savePath, 'r');
    const buffer = Buffer.alloc(5);
    fs.readSync(fd, buffer, 0, 5, 0);
    fs.closeSync(fd);
    
    const header = buffer.toString('utf8');
    expect(header, 'PDF should start with %PDF- header').toBe('%PDF-');
    
    // Filename should end with _watermarked.pdf
    const filename = download.suggestedFilename();
    expect(filename, 'Filename should contain _watermarked').toContain('_watermarked');
    expect(filename, 'Filename should end with .pdf').toMatch(/\.pdf$/);
  });

  test('Téléchargement image → nom de fichier dérivé du nom original', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    await page.setInputFiles('input[type="file"]', testPngPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    const download = await downloadPromise;
    
    const filename = download.suggestedFilename();
    expect(filename, 'Should contain base name').toContain('test-image');
  });

  test('Téléchargement PDF → nom de fichier dérivé du nom original', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    await page.setInputFiles('input[type="file"]', testPdfPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await waitForCanvasRender(page);
    
    const downloadPromise = page.waitForEvent('download', { timeout: 60000 });
    await page.click('#btn-download');
    const download = await downloadPromise;
    
    const filename = download.suggestedFilename();
    expect(filename, 'Should contain base name').toContain('download-test');
  });

  test('Bouton téléchargement sans fichier → pas de download', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    // Don't upload anything — workspace is hidden
    await expect(page.locator('#workspace')).toBeHidden();
    
    // Button should not be visible/clickable
    const btnDownload = page.locator('#btn-download');
    await expect(btnDownload).not.toBeVisible();
  });
});
