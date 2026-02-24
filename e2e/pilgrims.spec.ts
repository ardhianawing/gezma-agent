import { test, expect } from '@playwright/test';

async function loginAs(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**', { timeout: 15000 });
}

test.describe('Pilgrims', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin@test.com', 'password123');
  });

  test('navigate to pilgrims page', async ({ page }) => {
    await page.click('a[href="/pilgrims"]');
    await page.waitForURL('**/pilgrims**');
    await expect(page.locator('text=Jamaah').or(page.locator('text=Jemaah'))).toBeVisible({ timeout: 10000 });
  });

  test('shows pilgrim table or empty state', async ({ page }) => {
    await page.goto('/pilgrims');
    // Either a table with data or an empty state message
    const hasTable = page.locator('table').or(page.locator('text=Belum ada'));
    await expect(hasTable).toBeVisible({ timeout: 10000 });
  });

  test('shows add pilgrim button', async ({ page }) => {
    await page.goto('/pilgrims');
    await expect(
      page.locator('button:has-text("Tambah")').or(page.locator('button:has-text("tambah")'))
    ).toBeVisible({ timeout: 10000 });
  });
});
