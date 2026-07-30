import { expect, test, type Page } from '@playwright/test';

const mebibyte = 1024 * 1024;

async function transferSummary(page: Page) {
  return page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const navigation = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    const bytes = (entry: PerformanceResourceTiming | PerformanceNavigationTiming) =>
      entry.transferSize || entry.encodedBodySize;

    return {
      total: resources.reduce((sum, entry) => sum + bytes(entry), navigation ? bytes(navigation) : 0),
      images: resources
        .filter((entry) => entry.initiatorType === 'img')
        .reduce((sum, entry) => sum + bytes(entry), 0),
      urls: resources.map((entry) => new URL(entry.name).pathname)
    };
  });
}

test.describe('media performance budgets', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test('home stays within 2.5 MiB after the Hero autoplay sequence', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.sb-captions > .sb-caption:not(.cap-out)')).toHaveText('Stanford', {
      timeout: 8_000
    });
    await page.waitForLoadState('networkidle');

    const transfer = await transferSummary(page);
    expect(transfer.total, `home transferred ${transfer.total} bytes`).toBeLessThanOrEqual(
      2.5 * mebibyte
    );
    expect(transfer.urls.some((url) => url.startsWith('/generated/media/hero/'))).toBe(true);
    expect(transfer.urls.some((url) => url.startsWith('/home/sketchbook/'))).toBe(false);
    expect(transfer.urls).not.toContain('/headshot.png');
  });

  test('Album first load stays within 2 MiB and defers lightbox images until opening', async ({
    page
  }) => {
    const lightboxRequests: string[] = [];
    page.on('request', (request) => {
      const pathname = new URL(request.url()).pathname;
      if (pathname.startsWith('/generated/media/album-lightbox/')) {
        lightboxRequests.push(pathname);
      }
    });

    await page.goto('/album', { waitUntil: 'networkidle' });
    const transfer = await transferSummary(page);

    expect(transfer.total, `Album first load transferred ${transfer.total} bytes`).toBeLessThanOrEqual(
      2 * mebibyte
    );
    expect(transfer.urls.some((url) => url.startsWith('/generated/media/album-thumbnail/'))).toBe(
      true
    );
    expect(lightboxRequests).toHaveLength(0);

    await page.locator('.album-trigger').first().click();
    await expect(page.locator('.album-lightbox-image img')).toHaveAttribute(
      'src',
      /\/generated\/media\/album-lightbox\//
    );
    await expect.poll(() => lightboxRequests.length).toBeGreaterThan(0);
  });
});
