import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

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
    });

    // Seulement les violations "critical" et "moderate" doivent être zero
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

  test('contrôles accessibles', async ({ page }) => {
    const controls = page.locator('#controls');
    await expect(controls).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page }).include('#controls').analyze();

    expect(
      accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious' || v.impact === 'moderate',
      ),
    ).toHaveLength(0);
  });
});
