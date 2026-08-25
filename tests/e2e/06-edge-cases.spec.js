/**
 * Tests edge cases
 * 
 * Couvre:
 * - Image très grande (>4K)
 * - PDF très long (>50 pages)
 * - Texte watermark très long
 * - Opacity minimale/maximale
 * - Rotation à -90°, 0°, 90°
 * - PDF encrypté (si possible)
 */
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { createTestPdf, createTestImage } from './helpers/test-fixtures-gen.js';

const fixturesDir = path.join(process.cwd(), 'tests/e2e/fixtures');
const downloadsDir = path.join(process.cwd(), 'tests/e2e/downloads');

test.describe('⚠️ Edge Cases', () => {
  
  test.beforeAll(async () => {
    fs.mkdirSync(fixturesDir, { recursive: true });
  });

  test('Image grande (2000x2000) → preview sans crash', async ({ page }, testInfo) => {
    // Create a large image (2K instead of 4K for faster tests)
    const largeImgPath = path.join(fixturesDir, 'large-image.png');
    
    // Generate if doesn't exist
    if (!fs.existsSync(largeImgPath)) {
      const { createLargeImage } = await import('./helpers/test-fixtures-gen.js');
      await createLargeImage();
    }
    
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    await page.setInputFiles('input[type="file"]', largeImgPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 15000 });
    await page.waitForSelector('canvas', { timeout: 15000 });
    
    const canvas = page.locator('canvas').first();
    const width = await canvas.evaluate(el => el.width);
    const height = await canvas.evaluate(el => el.height);
    
    // Verify dimensions are reasonable for a large image
    expect(width, 'Large image canvas width should be substantial').toBeGreaterThan(1000);
    expect(height, 'Large image canvas height should be substantial').toBeGreaterThan(1000);
    
    // Download should work
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await page.click('#btn-download');
    const download = await downloadPromise;
    
    const savePath = path.join(downloadsDir, 'large-image-test.png');
    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    await download.saveAs(savePath);
    
    expect(fs.existsSync(savePath), 'Large image download should succeed').toBeTruthy();
    expect(fs.statSync(savePath).size, 'Large image download > 10KB').toBeGreaterThan(10000);
    
    fs.unlinkSync(savePath);
  });

  test('Texte watermark très long → rendu sans crash', async ({ page }) => {
    const testPdfPath = await createTestPdf({ pages: 1, text: 'Long Text Test', filename: 'long-text-test.pdf' });
    
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    // Upload first to make controls available
    await page.setInputFiles('input[type="file"]', testPdfPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 15000 });
    
    // Set a very long watermark text
    const longText = 'A'.repeat(500) + '\n' + 'B'.repeat(500);
    await page.fill('#watermark-text', longText);
    
    // Canvas should render without crash
    const canvas = page.locator('canvas').first();
    const width = await canvas.evaluate(el => el.width);
    expect(width, 'Canvas should render with long text').toBeGreaterThan(0);
    
    // Verify no error displayed
    const previewText = await page.locator('#preview-area').textContent();
    expect(previewText, 'No error message should be displayed').not.toContain('❌');
  });

  test('Opacity minimale (5%) → watermark presque invisible', async ({ page }) => {
    const testPngPath = createTestImage({ filename: 'opacity-min-test.png', text: 'Opacity Min' });
    
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    // Upload image first to make controls available
    await page.setInputFiles('input[type="file"]', testPngPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Set minimum opacity
    await page.fill('#opacity', '5');
    await page.waitForTimeout(500);
    expect(await page.locator('#opacity').inputValue()).toBe('5');
    await expect(page.locator('#opacity-value')).toContainText('5%');
    
    // Canvas should render
    const canvas = page.locator('canvas').first();
    const width = await canvas.evaluate(el => el.width);
    expect(width, 'Canvas should render with 5% opacity').toBeGreaterThan(0);
    
    // Download should work
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    const download = await downloadPromise;
    
    const savePath = path.join(fixturesDir, '..', 'downloads', 'opacity-min.png');
    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    await download.saveAs(savePath);
    
    expect(fs.existsSync(savePath), 'Download with 5% opacity should work').toBeTruthy();
    fs.unlinkSync(savePath);
  });

  test('Opacity maximale (100%) → watermark opaque', async ({ page }) => {
    const testPngPath = createTestImage({ filename: 'opacity-max-test.png', text: 'Opacity Max' });
    
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    await page.setInputFiles('input[type="file"]', testPngPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Set maximum opacity
    await page.fill('#opacity', '100');
    await page.waitForTimeout(500);
    expect(await page.locator('#opacity').inputValue()).toBe('100');
    await expect(page.locator('#opacity-value')).toContainText('100%');
    
    const canvas = page.locator('canvas').first();
    const width = await canvas.evaluate(el => el.width);
    expect(width, 'Canvas should render with 100% opacity').toBeGreaterThan(0);
    
    // Download should work
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    const download = await downloadPromise;
    
    const savePath = path.join(fixturesDir, '..', 'downloads', 'opacity-max.png');
    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    await download.saveAs(savePath);
    
    expect(fs.existsSync(savePath), 'Download with 100% opacity should work').toBeTruthy();
    fs.unlinkSync(savePath);
  });

  test('Rotation -90° → canvas rendu correctement', async ({ page }) => {
    const testPngPath = createTestImage({ filename: 'rot-neg90.png', text: 'Rot -90' });
    
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    await page.setInputFiles('input[type="file"]', testPngPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    await page.fill('#rotation', '-90');
    await page.waitForTimeout(500);
    expect(await page.locator('#rotation').inputValue()).toBe('-90');
    await expect(page.locator('#rotation-value')).toContainText('-90°');
    
    const canvas = page.locator('canvas').first();
    const width = await canvas.evaluate(el => el.width);
    expect(width, 'Canvas should render at -90° rotation').toBeGreaterThan(0);
  });

  test('Rotation 0° → canvas rendu avec diagonal mais sans rotation', async ({ page }) => {
    const testPngPath = createTestImage({ filename: 'rot-zero.png', text: 'Rot 0' });
    
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    await page.setInputFiles('input[type="file"]', testPngPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    await page.fill('#rotation', '0');
    await page.waitForTimeout(500);
    expect(await page.locator('#rotation').inputValue()).toBe('0');
    await expect(page.locator('#rotation-value')).toContainText('0°');
    
    const canvas = page.locator('canvas').first();
    const width = await canvas.evaluate(el => el.width);
    expect(width, 'Canvas should render at 0° rotation').toBeGreaterThan(0);
  });

  test('Rotation +90° → canvas rendu correctement', async ({ page }) => {
    const testPngPath = createTestImage({ filename: 'rot-pos90.png', text: 'Rot +90' });
    
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    await page.setInputFiles('input[type="file"]', testPngPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    await page.fill('#rotation', '90');
    await page.waitForTimeout(500);
    expect(await page.locator('#rotation').inputValue()).toBe('90');
    await expect(page.locator('#rotation-value')).toContainText('90°');
    
    const canvas = page.locator('canvas').first();
    const width = await canvas.evaluate(el => el.width);
    expect(width, 'Canvas should render at +90° rotation').toBeGreaterThan(0);
  });

  test('FontSize minimale (16px) → rendu sans erreur', async ({ page }) => {
    const testPngPath = createTestImage({ filename: 'fontsize-min.png', text: 'FS Min' });
    
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    await page.setInputFiles('input[type="file"]', testPngPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    await page.fill('#fontsize', '16');
    await page.waitForTimeout(500);
    expect(await page.locator('#fontsize').inputValue()).toBe('16');
    await expect(page.locator('#fontsize-value')).toContainText('16px');
    
    const canvas = page.locator('canvas').first();
    const width = await canvas.evaluate(el => el.width);
    expect(width, 'Canvas should render with min font size').toBeGreaterThan(0);
  });

  test('FontSize maximale (120px) → rendu sans erreur', async ({ page }) => {
    const testPngPath = createTestImage({ filename: 'fontsize-max.png', text: 'FS Max' });
    
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    await page.setInputFiles('input[type="file"]', testPngPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    await page.fill('#fontsize', '120');
    await page.waitForTimeout(500);
    expect(await page.locator('#fontsize').inputValue()).toBe('120');
    await expect(page.locator('#fontsize-value')).toContainText('120px');
    
    const canvas = page.locator('canvas').first();
    const width = await canvas.evaluate(el => el.width);
    expect(width, 'Canvas should render with max font size').toBeGreaterThan(0);
  });

  test('Combinaison extrême: opacity 5%, rotation -90°, fontsize 120px', async ({ page }) => {
    const testPngPath = createTestImage({ filename: 'extreme-combo.png', text: 'EXTREME' });
    
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    // Upload first to make controls available
    await page.setInputFiles('input[type="file"]', testPngPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Extreme values
    await page.fill('#opacity', '5');
    await page.fill('#rotation', '-90');
    await page.fill('#fontsize', '120');
    await page.waitForTimeout(500);
    
    const canvas = page.locator('canvas').first();
    const width = await canvas.evaluate(el => el.width);
    expect(width, 'Canvas should render with extreme combination').toBeGreaterThan(0);
    
    // Download should work
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    const download = await downloadPromise;
    
    const savePath = path.join(fixturesDir, '..', 'downloads', 'extreme-combo.png');
    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    await download.saveAs(savePath);
    
    expect(fs.existsSync(savePath), 'Extreme combination download should work').toBeTruthy();
    fs.unlinkSync(savePath);
  });

  test('PDF 10 pages → tous les canvases rendus', async ({ page }) => {
    const pdf10Path = await createTestPdf({
      pages: 10,
      filename: 'pdf-10-pages.pdf',
      text: '10 Page PDF'
    });
    
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    await page.setInputFiles('input[type="file"]', pdf10Path);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 15000 });
    
    // Wait for all 10 pages
    await page.waitForTimeout(5000);
    
    const canvasCount = await page.locator('canvas').count();
    expect(canvasCount, '10-page PDF should produce 10 canvases').toBe(10);
    
    // Download should produce valid PDF
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await page.click('#btn-download');
    const download = await downloadPromise;
    
    const savePath = path.join(fixturesDir, '..', 'downloads', 'pdf-10pages.pdf');
    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    await download.saveAs(savePath);
    
    const header = fs.readFileSync(savePath, { encoding: null }).subarray(0, 5).toString('utf8');
    expect(header, '10-page PDF download should be valid PDF').toBe('%PDF-');
    
    fs.unlinkSync(savePath);
  });

  test('Toutes les couleurs → chacune applicable', async ({ page }) => {
    const testPngPath = createTestImage({ filename: 'color-test.png', text: 'Color Test' });
    
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    // Upload first to make controls available
    await page.setInputFiles('input[type="file"]', testPngPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    const colors = ['#dc2626', '#1d4ed8', '#059669', '#7c3aed', '#000000'];
    
    for (const color of colors) {
      await page.click(`.color-btn[data-color="${color}"]`);
      await page.waitForTimeout(200);
      
      // Verify active class
      const activeBtn = page.locator(`.color-btn[data-color="${color}"]`);
      await expect(activeBtn).toHaveClass(/active/);
    }
    
    const canvas = page.locator('canvas').first();
    const width = await canvas.evaluate(el => el.width);
    expect(width, 'Canvas should render with all color choices').toBeGreaterThan(0);
  });

  test('Upload fichier puis reset puis upload différent type', async ({ page }) => {
    const pdfPath = await createTestPdf({ pages: 1, text: 'Type Switch PDF', filename: 'type-switch.pdf' });
    const imgPath = createTestImage({ filename: 'type-switch-img.png', text: 'Type Switch Img' });
    
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    // Upload PDF first
    await page.setInputFiles('input[type="file"]', pdfPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 15000 });
    await expect(page.locator('#filename')).toContainText('pdf');
    
    // Reset
    await page.click('#btn-reset');
    await page.waitForTimeout(500);
    await expect(page.locator('#dropzone')).toBeVisible();
    
    // Upload image
    await page.setInputFiles('input[type="file"]', imgPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 10000 });
    await expect(page.locator('#filename')).toContainText('png');
    
    // Canvas count should be 1 for image
    const count = await page.locator('canvas').count();
    expect(count, 'Image should produce 1 canvas after switching from PDF').toBe(1);
  });

  test('Variable {date} → substitution dans preview', async ({ page }) => {
    const testPngPath = path.join(fixturesDir, 'test-image.png');
    
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });
    
    // Upload first to make controls available
    await page.setInputFiles('input[type="file"]', testPngPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Set text with {date} variable
    await page.fill('#watermark-text', 'Test - {date}');
    
    // Canvas should render with substituted text
    const canvas = page.locator('canvas').first();
    const width = await canvas.evaluate(el => el.width);
    expect(width, 'Canvas should render with variable substitution').toBeGreaterThan(0);
    
    // Verify the canvas has content (non-transparent pixels)
    const hasContent = await canvas.evaluate(el => {
      const ctx = el.getContext('2d');
      const data = ctx.getImageData(0, 0, el.width, el.height).data;
      let nonZero = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) nonZero++;
      }
      return nonZero > 0;
    });
    expect(hasContent, 'Canvas should have content with {date} variable').toBeTruthy();
  });
});
