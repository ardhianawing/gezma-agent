import { test, expect } from '@playwright/test';

test.describe('Command Center', () => {
  test('CC login page shows form', async ({ page }) => {
    await page.goto('/command-center/login');
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
  });

  test('unauthenticated CC user redirected to login', async ({ page }) => {
    await page.goto('/command-center');
    await page.waitForURL('**/command-center/login**', { timeout: 10000 });
    expect(page.url()).toContain('/command-center/login');
  });

  test('CC login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/command-center/login');
    await page.fill('input[type="email"], input[name="email"]', 'wrong@test.com');
    await page.fill('input[type="password"], input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await expect(
      page.locator('text=salah').or(page.locator('text=invalid').or(page.locator('text=Error')))
    ).toBeVisible({ timeout: 10000 });
  });
});
