import { test, expect } from '@playwright/test';

async function loginAs(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**', { timeout: 15000 });
}

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin@test.com', 'password123');
  });

  test('sidebar navigation between pages', async ({ page }) => {
    // Navigate to packages
    await page.click('a[href="/packages"]');
    await page.waitForURL('**/packages**');
    await expect(page.locator('text=Paket')).toBeVisible({ timeout: 10000 });

    // Navigate to trips
    await page.click('a[href="/trips"]');
    await page.waitForURL('**/trips**');
    await expect(page.locator('text=Perjalanan').or(page.locator('text=Trip'))).toBeVisible({ timeout: 10000 });

    // Navigate to reports
    await page.click('a[href="/reports"]');
    await page.waitForURL('**/reports**');
    await expect(page.locator('text=Laporan').or(page.locator('text=Report'))).toBeVisible({ timeout: 10000 });
  });

  test('navigate to academy', async ({ page }) => {
    await page.click('a[href="/academy"]');
    await page.waitForURL('**/academy**');
    await expect(page.locator('text=Academy').or(page.locator('text=Akademi'))).toBeVisible({ timeout: 10000 });
  });

  test('navigate to blockchain', async ({ page }) => {
    await page.click('a[href="/blockchain"]');
    await page.waitForURL('**/blockchain**');
    await expect(page.locator('text=Blockchain').or(page.locator('text=Sertifikat'))).toBeVisible({ timeout: 10000 });
  });
});
