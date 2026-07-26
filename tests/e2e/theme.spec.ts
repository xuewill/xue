import { expect, test } from '@playwright/test';

test('theme controls stay synchronized across responsive breakpoints', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.addInitScript(() => localStorage.setItem('xue-theme', 'light'));
  await page.goto('/');

  const root = page.locator('html');
  const pullCord = page.getByRole('switch', { name: 'Pull to turn on the light' });

  await pullCord.click({ force: true });
  await expect(root).toHaveAttribute('data-theme', 'dark', { timeout: 3_000 });

  await page.setViewportSize({ width: 390, height: 844 });
  const themeToggle = page.getByRole('button', { name: 'Use light theme' });

  await expect(themeToggle).toBeVisible();
  await expect(themeToggle).toHaveAttribute('aria-pressed', 'true');
  await themeToggle.click();
  await expect(root).toHaveAttribute('data-theme', 'light');
});
