import { expect, test } from '@playwright/test';

const pages = [
  { path: '/', heading: 'Will Xue' },
  { path: '/404', heading: 'Page not found' },
  { path: '/album', heading: 'Album' },
  { path: '/archive', heading: /record of making/i },
  { path: '/blog', heading: 'Blog' },
  { path: '/blog/typed-content-media-pipeline', heading: 'A typed content and media pipeline' },
  { path: '/blog/tags', heading: 'Blog topics' },
  { path: '/blog/tags/design', heading: 'Design' },
  { path: '/design-system', heading: /Design System/i },
  { path: '/home/canopycoffee', heading: 'CanopyCoffee' }
] as const;

for (const route of pages) {
  test(`${route.path} preserves its page contract`, async ({ page }) => {
    const runtimeErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(message.text());
    });
    page.on('pageerror', (error) => runtimeErrors.push(error.message));

    const response = await page.goto(route.path);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: route.heading })).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    expect(runtimeErrors).toEqual([]);
  });
}

test('the archive filter remains keyboard-operable', async ({ page }) => {
  await page.goto('/archive');

  const writing = page.getByRole('button', { name: 'Writing' });
  await writing.focus();
  await writing.press('Enter');

  await expect(writing).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.archive-post')).not.toHaveCount(0);
  await expect(page.locator('.archive-album')).toHaveCount(0);
});

test('unknown routes keep the shared error-page contract', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', { name: 'home', exact: true })).toHaveAttribute(
    'href',
    '/'
  );
});
