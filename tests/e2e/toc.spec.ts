import { expect, test } from '@playwright/test';

test('prerendered articles expose heading anchors and a complete TOC without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:4173/blog/markdown-format-showcase');
  await expect(page.locator('h2#text-styles')).toHaveText('Text styles');
  await expect(page.locator('.article-toc a[href="#text-styles"]')).toHaveText('Text styles');

  await context.close();
});
