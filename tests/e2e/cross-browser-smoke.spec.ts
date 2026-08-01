import { expect, test } from '@playwright/test';

test('core public flow renders and responds without runtime errors', async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.goto('/');
  await expect(page).toHaveTitle(/Will Xue/);
  await expect(page.getByRole('heading', { level: 1, name: 'Will Xue' })).toBeVisible();

  await page.getByRole('link', { name: 'blog', exact: true }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Browse topics' })).toBeVisible();

  await page.goto('/archive');
  await expect(page.getByRole('heading', { level: 1, name: /record of making/ })).toBeVisible();

  await page.goto('/album');
  await page.getByRole('button', { name: /^View image:/ }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.locator('.album-lightbox-close').click();
  await expect(dialog).toBeHidden();

  expect(runtimeErrors).toEqual([]);
});
