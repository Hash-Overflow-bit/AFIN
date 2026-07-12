import { test, expect } from '@playwright/test';

test.describe('Role-Based Access Control (RBAC)', () => {
  test('Guest users should be redirected to login for protected pages', async ({ page }) => {
    // Attempt to access dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);

    // Attempt to access marketplace
    await page.goto('/marketplace');
    await expect(page).toHaveURL(/\/login/);

    // Attempt to access broker dashboard
    await page.goto('/broker/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Investor should not be allowed to access broker/admin routes', async ({ page }) => {
    // 1. Log in as Investor
    await page.goto('/login');
    await page.fill('#email', 'investor@afin.com');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // 2. Try to access broker dashboard (should redirect to unauthorized)
    await page.goto('/broker/dashboard');
    await expect(page).toHaveURL(/\/unauthorized/);

    // 3. Try to access admin dashboard (should redirect to unauthorized)
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/unauthorized/);
  });
});
