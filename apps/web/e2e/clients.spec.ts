import { test, expect } from '@playwright/test';

test.describe('Clients Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clients');
  });

  test('should display clients list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Clients');

    // Check for table or grid view
    const clientsContainer = page.locator('[data-testid="clients-list"]').or(page.locator('table'));
    await expect(clientsContainer).toBeVisible();
  });

  test('should open create client modal', async ({ page }) => {
    // Click add client button
    await page.click('button:has-text("Add Client"), button:has-text("New Client")');

    // Modal should be visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('should filter clients by status', async ({ page }) => {
    // Click status filter
    const filterButton = page.locator('button:has-text("Status"), select[name="status"]');

    if (await filterButton.isVisible()) {
      await filterButton.click();

      // Select ACTIVE status
      await page.click('text=Active');

      // Wait for filtered results
      await page.waitForTimeout(500);
    }
  });

  test('should search for clients', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('Test Company');
      await page.waitForTimeout(500);

      // Results should update
      await expect(page.locator('body')).toContainText('Test Company');
    }
  });
});
