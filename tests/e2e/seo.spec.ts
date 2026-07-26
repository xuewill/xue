import { expect, test } from '@playwright/test';

test('robots and page metadata use the canonical site URL', async ({ page, request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain('Sitemap: https://willxue.com/sitemap.xml');

  await page.goto('/blog/building-this-site');
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    'content',
    'https://willxue.com/blog/building-this-site'
  );
  await expect(page.locator('meta[name="description"]')).toHaveCount(1);

  await page.goto('/home/art');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Art');
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    'content',
    'An ongoing collection of mixed-media artwork.'
  );
});
