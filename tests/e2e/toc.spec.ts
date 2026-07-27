import { expect, test } from '@playwright/test';

test('prerendered articles expose heading anchors and a complete TOC without JavaScript', async ({
  browser,
  baseURL
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto(
    new URL('/blog/markdown-format-showcase', baseURL ?? 'http://127.0.0.1:4173').href
  );
  await expect(page.locator('h2#text-styles')).toHaveText('Text styles');
  await expect(page.locator('.article-toc a[href="#text-styles"]')).toHaveText('Text styles');

  await context.close();
});
