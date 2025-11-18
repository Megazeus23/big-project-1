import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
  });

  test('should display dashboard page', async ({ page }) => {
    await expect(page).toHaveTitle(/BioLab/);
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show statistics cards', async ({ page }) => {
    // Check for stats cards
    await expect(page.locator('text=Active Clients')).toBeVisible();
    await expect(page.locator('text=Certifications')).toBeVisible();
    await expect(page.locator('text=Pending Tasks')).toBeVisible();
  });

  test('should navigate to clients page', async ({ page }) => {
    await page.click('a[href="/clients"]');
    await page.waitForURL('/clients');
    await expect(page.locator('h1')).toContainText('Clients');
  });

  test('should navigate to tasks page', async ({ page }) => {
    await page.click('a[href="/tasks"]');
    await page.waitForURL('/tasks');
    await expect(page.locator('h1')).toContainText('Tasks');
  });

  test('should navigate to documents page', async ({ page }) => {
    await page.click('a[href="/documents"]');
    await page.waitForURL('/documents');
    await expect(page.locator('h1')).toContainText('Documents');
  });
});
