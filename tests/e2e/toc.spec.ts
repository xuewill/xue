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

test('desktop article TOC remains visible outside the centered article column', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/blog/designing-canopy-coffee');
  await page.locator('.article-page').evaluate(async (articlePage) => {
    await Promise.all(articlePage.getAnimations().map((animation) => animation.finished));
  });

  const leftEdgesAreVisible = await page.locator('.article-toc').evaluate((toc) => {
    const elements = [
      toc.querySelector<HTMLElement>('.article-toc-title'),
      ...toc.querySelectorAll<HTMLElement>('.toc-section-link')
    ].filter((element): element is HTMLElement => element !== null);

    return elements.every((element) => {
      const bounds = element.getBoundingClientRect();
      const hit = document.elementFromPoint(bounds.left + 1, bounds.top + bounds.height / 2);
      return hit === element || element.contains(hit);
    });
  });

  expect(leftEdgesAreVisible).toBe(true);
});
