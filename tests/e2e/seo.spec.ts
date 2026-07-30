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
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    /https:\/\/willxue\.com\/generated\/og\/building-this-site\.[a-f0-9]{12}\.png/
  );
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');

  const articleJsonLd = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}'
  );
  expect(articleJsonLd).toMatchObject({
    '@type': 'BlogPosting',
    headline: 'Building this site with SvelteKit',
    datePublished: '2026-07-17',
    dateModified: '2026-07-29'
  });

  await page.goto('/home/art');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Art');
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    'content',
    'An ongoing collection of mixed-media artwork.'
  );
  const projectJsonLd = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}'
  );
  expect(projectJsonLd).toMatchObject({ '@type': 'CreativeWork', name: 'Art' });
});

test('home and tag pages publish structured, canonical, no-JavaScript-readable content', async ({
  page,
  request
}) => {
  await page.goto('/');
  const homeJsonLd = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}'
  );
  expect(homeJsonLd['@graph'].map((item: { '@type': string }) => item['@type'])).toEqual([
    'Person',
    'WebSite'
  ]);

  const tagResponse = await request.get('/blog/tags/art');
  expect(tagResponse.ok()).toBe(true);
  const tagHtml = await tagResponse.text();
  expect(tagHtml).toContain('Mixed-media city studies');
  expect(tagHtml).toContain('https://willxue.com/blog/tags/art');

  await page.goto('/blog/tags/art');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://willxue.com/blog/tags/art'
  );
});

test('sitemap and RSS include discovery routes, last-modified dates, and categories', async ({
  request
}) => {
  const sitemap = await request.get('/sitemap.xml');
  const sitemapXml = await sitemap.text();
  expect(sitemap.ok()).toBe(true);
  expect(sitemapXml).toContain('<loc>https://willxue.com/blog/tags/art</loc>');
  expect(sitemapXml).toContain('<lastmod>2026-07-29</lastmod>');

  const rss = await request.get('/rss.xml');
  const rssXml = await rss.text();
  expect(rss.ok()).toBe(true);
  expect(rssXml).toContain('<category>Engineering</category>');
  expect(rssXml).toContain('<category>Publishing</category>');
});

test('CSP permits Pages Web Analytics without embedding a duplicate beacon', async ({
  request
}) => {
  const response = await request.get('/');
  const html = await response.text();

  expect(response.ok()).toBe(true);
  expect(html).toMatch(
    /script-src[^;]*https:\/\/static\.cloudflareinsights\.com/
  );
  expect(html).toMatch(
    /connect-src[^;]*https:\/\/cloudflareinsights\.com/
  );
  expect(html).not.toContain('beacon.min.js');
  expect(html).not.toContain('data-cf-beacon');
});

test('discovery pages stay within the target viewports', async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 1000 }
  ]) {
    await page.setViewportSize(viewport);

    for (const path of ['/blog/tags', '/blog/mixed-media-city-studies']) {
      await page.goto(path);
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));
      expect(dimensions.scrollWidth, `${path} overflows at ${viewport.width}px`).toBeLessThanOrEqual(
        dimensions.clientWidth
      );
    }
  }
});

test('the static build includes a real not-found page for missing assets', async ({ request }) => {
  const response = await request.get('/404.html');

  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain('Page not found');
});
