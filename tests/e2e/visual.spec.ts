import { expect, test } from '@playwright/test';

/*
 * Visual regression for the catalogue.
 *
 * Baselines are generated inside the Playwright container by
 * scripts/visual-baseline.sh so they match CI. Running this project on a host
 * with different font rendering will fail every snapshot — that is why it is
 * opt-in via PLAYWRIGHT_VISUAL rather than part of `npm run test:e2e`.
 *
 * These cover observable appearance, which the DOM and token assertions in
 * tests/unit/design-system.test.ts cannot: a token edit that quietly changes
 * how twenty components look still passes every other check in the suite.
 */

const THEMES = ['light', 'dark'] as const;

/** Sections chosen for density of distinct visual treatments, not for coverage of every anchor. */
const SECTIONS = ['color', 'type', 'components', 'motion', 'materials'] as const;

/*
 * Full-page capture is limited to the narrow breakpoints on purpose.
 *
 * At 1440px the hero h1 resolves to its 112px clamp ceiling, which puts
 * "Design System_" right on the wrap boundary. Sub-pixel font-metric differences
 * flip it between one and two lines, moving everything below it by one 93px line
 * box, so the stitched image is a different height between runs and no pixel
 * tolerance can reconcile it. Below 980px the clamp bottoms out at 54px and the
 * wrap is unambiguous.
 *
 * Desktop is not left uncovered: the section captures below run at 1440px.
 */
const BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 900 },
  { name: 'tablet', width: 768, height: 1024 }
] as const;

async function settle(page: import('@playwright/test').Page, theme: string) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/design-system');
  await page.evaluate((value) => {
    document.documentElement.setAttribute('data-theme', value);
  }, theme);
  // Fonts drive nearly every measurement on this page; screenshotting before
  // they load produces a fallback-metric baseline that never reproduces.
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('h1')).toBeVisible();

  /*
    Then wait for the document height to hold still. In the Linux container the
    hero h1 was settling one line late, changing total height by ~93px — exactly
    its line box (112px * 0.83) — which made full-page captures compare against a
    differently sized baseline. Height equality is the cheapest reliable signal
    that layout has stopped moving.
  */
  await expect
    .poll(
      async () => {
        const first = await page.evaluate(() => document.documentElement.scrollHeight);
        await page.waitForTimeout(120);
        const second = await page.evaluate(() => document.documentElement.scrollHeight);
        return first === second ? second : -1;
      },
      { message: 'document height never stopped changing', timeout: 10_000 }
    )
    .toBeGreaterThan(0);
}

for (const theme of THEMES) {
  for (const breakpoint of BREAKPOINTS) {
    test(`design system renders consistently in ${theme} at ${breakpoint.name}`, async ({ page }) => {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await settle(page, theme);

      await expect(page).toHaveScreenshot(`page-${theme}-${breakpoint.name}.png`, {
        fullPage: true,
        animations: 'disabled'
      });
    });
  }
}

for (const theme of THEMES) {
  for (const section of SECTIONS) {
    test(`${section} section renders consistently in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await settle(page, theme);

      await expect(page.locator(`#${section}`)).toHaveScreenshot(`${section}-${theme}.png`, {
        animations: 'disabled'
      });
    });
  }
}
