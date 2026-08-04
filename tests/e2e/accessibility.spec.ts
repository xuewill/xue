import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = ['/', '/blog', '/blog/building-this-site', '/home/art', '/album', '/archive', '/design-system'];
const themes = ['light', 'dark'] as const;
const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const route of routes) {
  for (const theme of themes) {
    test(`${route} has no automatically detectable WCAG A/AA violations in ${theme} mode`, async ({
      page
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
      await page.goto(route);
      // theme-init.js resolves the initial theme from prefers-color-scheme.
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

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
}
