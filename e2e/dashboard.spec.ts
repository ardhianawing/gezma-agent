import { test, expect } from '@playwright/test';

// Helper to login and get authenticated state
async function loginAs(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**', { timeout: 15000 });
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test credentials (must exist in seeded DB)
    await loginAs(page, 'admin@test.com', 'password123');
  });

  test('shows dashboard page with stats', async ({ page }) => {
    await expect(page.locator('text=Dasbor').or(page.locator('text=Dashboard'))).toBeVisible({ timeout: 10000 });
  });

  test('can navigate to gamification page', async ({ page }) => {
    await page.click('a[href="/gamification"]');
    await page.waitForURL('**/gamification**');
    await expect(page.locator('text=Gamifikasi').or(page.locator('text=Leaderboard'))).toBeVisible({ timeout: 10000 });
  });
});
