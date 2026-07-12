import { test, expect } from '@playwright/test';

test.describe('Edge Cases & Input Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as investor
    await page.goto('/login');
    await page.fill('#email', 'investor@afin.com');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test('Should validate order constraints (minimum and multiples)', async ({ page }) => {
    // 1. Go to marketplace
    await page.goto('/marketplace');
    
    // 2. Find Mughal Steels card and click details
    const bondLink = page.locator('text=Mughal Steels');
    await expect(bondLink).toBeVisible({ timeout: 15000 });
    await bondLink.click();

    // Verify detail page loads
    await expect(page).toHaveURL(/\/marketplace\/[0-9a-fA-F-]{36}/);

    // 3. Click "Invest Now" button
    const investButton = page.locator('button:has-text("Invest Now")');
    await expect(investButton).toBeVisible();
    await investButton.click();

    // Verify modal is open
    await expect(page.locator('h2:has-text("Place Investment")')).toBeVisible();

    // 4. Try putting an amount below minimum (e.g. 5000 when min is 7000)
    const input = page.locator('input[type="number"]');
    await input.fill('5000');
    
    // Try to click Confirm
    const confirmBtn = page.locator('button:has-text("Confirm")');
    await confirmBtn.click();
    
    // Verify that the modal stays open (blocked by HTML5 validation or form handler)
    await expect(page.locator('h2:has-text("Place Investment")')).toBeVisible();

    // 5. Try putting an invalid multiple amount (e.g. 8000 when multiple step is 3500)
    await input.fill('8000');
    await confirmBtn.click();
    
    // Verify that the modal stays open
    await expect(page.locator('h2:has-text("Place Investment")')).toBeVisible();
  });
});
