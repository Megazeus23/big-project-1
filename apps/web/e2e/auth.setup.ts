import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');

  // Fill in credentials
  await page.fill('input[name="email"]', 'admin@biolab-consulting.com');
  await page.fill('input[name="password"]', 'admin123');

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard');

  // Verify logged in
  await expect(page.locator('text=Dashboard')).toBeVisible();

  // Save authenticated state
  await page.context().storageState({ path: authFile });
});
