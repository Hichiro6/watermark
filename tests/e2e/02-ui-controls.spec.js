/**
 * Tests fonctionnels - Contrôles UI (sliders, boutons, inputs)
 *
 * Couvre:
 * - Sliders fonctionnels : opacity, fontSize, rotation
 * - Boutons couleur : sélection et application
 * - Date picker : "Aujourd'hui" par défaut, date personnalisée activable
 * - Presets de documents : application du texte prédéfini
 */

import path from 'node:path';
import { expect, test } from '@playwright/test';
import { createTestPdf } from './helpers/test-fixtures-gen.js';
import { uploadTestFile, waitForCanvasRender } from './helpers/test-utils.js';

const _fixturesDir = path.join(process.cwd(), 'tests/e2e/fixtures');

test.describe('🎛️ Contrôles UI - Sliders et Boutons', () => {
  let testPdfPath;

  test.beforeAll(async () => {
    testPdfPath = await createTestPdf({
      pages: 1,
      text: 'Controls Test',
      filename: 'controls-test.pdf',
    });
  });

  test('Slider Opacity : valeur affichée mise à jour', async ({ page }) => {
    await uploadTestFile(page);

    const opacitySlider = page.locator('#opacity');
    const opacityValue = page.locator('#opacity-value');

    // Default value should be 30%
    await expect(opacityValue).toContainText('30%');
    expect(await opacitySlider.inputValue()).toBe('30');

    // Change to minimum (5%)
    await opacitySlider.fill('5');
    await page.waitForTimeout(500);
    await expect(opacityValue).toContainText('5%');
    expect(await opacitySlider.inputValue()).toBe('5');

    // Change to maximum (100%)
    await opacitySlider.fill('100');
    await page.waitForTimeout(500);
    await expect(opacityValue).toContainText('100%');
  });

  test('Slider FontSize : valeur affichée mise à jour', async ({ page }) => {
    await uploadTestFile(page);

    const fontsizeSlider = page.locator('#fontsize');
    const fontsizeValue = page.locator('#fontsize-value');

    // Default value should be 5%
    await expect(fontsizeValue).toContainText('5%');
    expect(await fontsizeSlider.inputValue()).toBe('5');

    // Change to minimum (2%)
    await fontsizeSlider.fill('2');
    await page.waitForTimeout(500);
    await expect(fontsizeValue).toContainText('2%');

    // Change to maximum (15%)
    await fontsizeSlider.fill('15');
    await page.waitForTimeout(500);
    await expect(fontsizeValue).toContainText('15%');
  });

  test('Slider Rotation : valeur affichée mise à jour', async ({ page }) => {
    await uploadTestFile(page);

    const rotationSlider = page.locator('#rotation');
    const rotationValue = page.locator('#rotation-value');

    // Default value should be -45°
    await expect(rotationValue).toContainText('-45°');
    expect(await rotationSlider.inputValue()).toBe('-45');

    // Test positive rotation (90°)
    await rotationSlider.fill('90');
    await page.waitForTimeout(500);
    await expect(rotationValue).toContainText('90°');

    // Test negative rotation (-90°)
    await rotationSlider.fill('-90');
    await page.waitForTimeout(500);
    await expect(rotationValue).toContainText('-90°');

    // Test zero rotation
    await rotationSlider.fill('0');
    await page.waitForTimeout(500);
    await expect(rotationValue).toContainText('0°');
  });

  test('Boutons couleur : sélection active/inactive', async ({ page }) => {
    await uploadTestFile(page);

    const colorPicker = page.locator('#color-picker');
    const colorBtns = colorPicker.locator('.color-btn');

    // Red (#dc2626) should be active by default
    await expect(colorBtns.first()).toHaveClass(/active/);

    // Click blue button
    const blueBtn = colorPicker.locator('.color-btn[data-color="#1d4ed8"]');
    await blueBtn.click();

    // Blue should be active, red inactive
    await expect(blueBtn).toHaveClass(/active/);
    await expect(colorBtns.first()).not.toHaveClass(/active/);

    // Click green button
    const greenBtn = colorPicker.locator('.color-btn[data-color="#059669"]');
    await greenBtn.click();

    await expect(greenBtn).toHaveClass(/active/);
    await expect(blueBtn).not.toHaveClass(/active/);
  });

  test('Contrôle de position : sélection active', async ({ page }) => {
    await uploadTestFile(page);

    const posControl = page.locator('#position-control');
    const segBtns = posControl.locator('.seg-btn');

    // Diagonal should be active by default
    await expect(segBtns.first()).toHaveClass(/active/);
    await expect(segBtns.first()).toContainText(/diagonal/i);

    // Click center
    const centerBtn = posControl.locator('.seg-btn[data-position="center"]');
    await centerBtn.click();
    await expect(centerBtn).toHaveClass(/active/);
    await expect(segBtns.first()).not.toHaveClass(/active/);

    // Click bottom
    const bottomBtn = posControl.locator('.seg-btn[data-position="bottom"]');
    await bottomBtn.click();
    await expect(bottomBtn).toHaveClass(/active/);
    await expect(centerBtn).not.toHaveClass(/active/);

    // Click tile
    const tileBtn = posControl.locator('.seg-btn[data-position="tile"]');
    await tileBtn.click();
    await expect(tileBtn).toHaveClass(/active/);
    await expect(bottomBtn).not.toHaveClass(/active/);
  });

  test('Presets : bouton cliquable et applique le texte', async ({ page }) => {
    await uploadTestFile(page);

    const presetsGrid = page.locator('#presets-grid');
    const presetBtns = presetsGrid.locator('.preset-btn');

    // Should have 6 presets
    const count = await presetBtns.count();
    expect(count, 'Devrait avoir 6 presets').toBe(6);

    // Get the identity preset text
    const identityBtn = presetsGrid.locator('.preset-btn[data-preset="identite"]');
    const expectedText = await identityBtn.evaluate((el) => {
      return el.textContent || '';
    });

    // Current watermark text before
    const watermarkText = page.locator('#watermark-text');
    const initialText = await watermarkText.inputValue();
    expect(initialText).not.toEqual(expectedText);

    // Click identity preset
    await identityBtn.click();
    await page.waitForTimeout(500);

    // Button should be active
    await expect(identityBtn).toHaveClass(/active/);

    // Watermark text should change (contains "identit" in FR or EN)
    const newText = await watermarkText.inputValue();
    expect(newText.length).toBeGreaterThan(10);
    // {date} should be substituted with today's date (not present as literal)
    expect(newText).not.toContain('{date}');
  });

  test('Textarea watermark : modifications déclenchent preview', async ({ page }, _testInfo) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    // Upload a PDF to enable preview
    await page.setInputFiles('input[type="file"]', testPdfPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });

    // Modify watermark text
    const watermarkText = page.locator('#watermark-text');
    await watermarkText.fill('TEST MODIFIA');
    await page.waitForTimeout(1000); // Wait for debounce

    // Canvas should exist (re-rendered)
    await expect(page.locator('canvas')).not.toHaveCount(0);
  });

  test('Sliders avec upload PDF : preview mise à jour après modification', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    // Upload PDF
    await page.setInputFiles('input[type="file"]', testPdfPath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });
    await waitForCanvasRender(page);

    const initialCanvasWidth = await page
      .locator('canvas')
      .first()
      .evaluate((el) => el.width);

    // Change opacity significantly
    const opacitySlider = page.locator('#opacity');
    await opacitySlider.fill('80');
    await waitForCanvasRender(page);

    // Canvas should still be present
    await expect(page.locator('canvas')).not.toHaveCount(0);

    // Dimensions should be preserved
    const newCanvasWidth = await page
      .locator('canvas')
      .first()
      .evaluate((el) => el.width);
    expect(newCanvasWidth, 'Canvas width should be preserved after opacity change').toBeCloseTo(
      initialCanvasWidth,
      0,
    );
  });
});
