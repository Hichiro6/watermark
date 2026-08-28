import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures');

// Helper: create a small PNG using canvas in the browser
async function createTestImage(_page, filename) {
  const filePath = path.join(fixturesDir, filename);
  const { execSync } = await import('node:child_process');
  try {
    execSync(`test -f "${filePath}"`);
  } catch {
    execSync(`convert -size 200x200 xc:white "${filePath}" 2>/dev/null || python3 -c "
from PIL import Image
img = Image.new('RGB', (200, 200), 'white')
img.save('${filePath}')
" 2>/dev/null || echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8/5+hgQABAAD/Apf9AAAAAElFTkSuQmCC" | base64 -d > "${filePath}"`);
  }
  return filePath;
}

test.describe('Accessibilité (axe-core)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test("page d'accueil sans violations majeures", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    console.log(`Violations trouvées: ${accessibilityScanResults.violations.length}`);
    accessibilityScanResults.violations.forEach((v) => {
      console.log(`  - [${v.impact}] ${v.id}: ${v.description}`);
      v.nodes.forEach((n) => {
        console.log(`    target: ${n.target.join(', ')}, html: ${n.html.substring(0, 100)}`);
      });
    });

    // Seulement les violations "critical", "serious" et "moderate" doivent être zero
    const criticalOrModerate = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious' || v.impact === 'moderate',
    );

    expect(criticalOrModerate).toHaveLength(0);
  });

  test('dropzone accessible', async ({ page }) => {
    const dropzone = page.locator('#dropzone');
    await expect(dropzone).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page }).include('#dropzone').analyze();

    expect(accessibilityScanResults.violations).toHaveLength(0);
  });

  test('contrôles accessibles après upload', async ({ page }) => {
    // Upload a file first to reveal the workspace + controls
    const testImagePath = await createTestImage(page, 'a11y-test.png');
    await page.setInputFiles('input[type="file"]', testImagePath);
    await expect(page.locator('#workspace')).toBeVisible({ timeout: 10000 });

    // Target the controls section by class (no #controls ID exists)
    const controls = page.locator('.controls');
    await expect(controls).toBeVisible({ timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page }).include('.controls').analyze();

    expect(
      accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious' || v.impact === 'moderate',
      ),
    ).toHaveLength(0);
  });
});
