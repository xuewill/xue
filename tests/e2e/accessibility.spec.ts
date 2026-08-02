import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = ['/', '/blog', '/blog/building-this-site', '/home/art', '/album', '/archive', '/design-system'];
const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const route of routes) {
  test(`${route} has no automatically detectable WCAG A/AA violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);

    const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
    const report = results.violations
      .map(
        (violation) =>
          `${violation.id} (${violation.impact ?? 'unknown'}): ${violation.nodes
            .map((node) => node.target.join(' '))
            .join(', ')}`
      )
      .join('\n');

    expect(results.violations, report).toEqual([]);
  });
}
