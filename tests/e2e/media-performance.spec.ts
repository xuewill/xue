import { expect, test, type Page } from '@playwright/test';
import performanceBudget from '../../performance-budget.json' with { type: 'json' };

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

type LabMetrics = {
  lcp: number;
  cls: number;
  interactions: Array<{ duration: number; interactionId: number }>;
};

type LayoutShiftEntry = PerformanceEntry & { hadRecentInput: boolean; value: number };

async function installLabObservers(page: Page) {
  await page.addInitScript(() => {
    const metrics: LabMetrics = { lcp: 0, cls: 0, interactions: [] };
    Object.assign(window, { __labMetrics: metrics });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) metrics.lcp = entry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LayoutShiftEntry[]) {
        if (!entry.hadRecentInput) metrics.cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEventTiming[]) {
        if (entry.interactionId) {
          metrics.interactions.push({ duration: entry.duration, interactionId: entry.interactionId });
        }
      }
    }).observe({
      type: 'event',
      buffered: true,
      durationThreshold: 16
    } as PerformanceObserverInit & { durationThreshold: number });
  });
}

async function enableLabProfile(page: Page) {
  const session = await page.context().newCDPSession(page);
  const profile = performanceBudget.lab.profile;
  await session.send('Network.enable');
  await session.send('Network.setCacheDisabled', { cacheDisabled: true });
  await session.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: profile.latencyMs,
    downloadThroughput: (profile.downloadKbps * 1024) / 8,
    uploadThroughput: (profile.uploadKbps * 1024) / 8
  });
  await session.send('Emulation.setCPUThrottlingRate', { rate: profile.cpuSlowdown });
}

async function labMetrics(page: Page) {
  return page.evaluate(() => (window as typeof window & { __labMetrics: LabMetrics }).__labMetrics);
}

function observedInp(metrics: LabMetrics) {
  const interactions = new Map<number, number>();
  for (const entry of metrics.interactions) {
    interactions.set(entry.interactionId, Math.max(interactions.get(entry.interactionId) ?? 0, entry.duration));
  }
  return Math.max(0, ...interactions.values());
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

  test('Home laboratory LCP, CLS, and interaction latency stay within good thresholds', async ({
    page
  }) => {
    await enableLabProfile(page);
    await installLabObservers(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.sb-captions > .sb-caption:not(.cap-out)')).toHaveText('Stanford', {
      timeout: 8_000
    });
    await page.getByRole('button', { name: 'Next page' }).last().click();
    await page.waitForTimeout(100);

    const metrics = await labMetrics(page);
    const inp = observedInp(metrics);
    expect(metrics.lcp, `Home LCP was ${metrics.lcp.toFixed(0)} ms`).toBeGreaterThan(0);
    expect(metrics.lcp, `Home LCP was ${metrics.lcp.toFixed(0)} ms`).toBeLessThanOrEqual(
      performanceBudget.lab.lcpMs
    );
    expect(metrics.cls, `Home CLS was ${metrics.cls.toFixed(4)}`).toBeLessThanOrEqual(
      performanceBudget.lab.cls
    );
    expect(inp, `Home observed interaction latency was ${inp.toFixed(0)} ms`).toBeGreaterThan(0);
    expect(inp, `Home observed interaction latency was ${inp.toFixed(0)} ms`).toBeLessThanOrEqual(
      performanceBudget.lab.inpMs
    );
  });

  test('Album laboratory LCP and CLS stay within good thresholds', async ({ page }) => {
    await enableLabProfile(page);
    await installLabObservers(page);
    await page.goto('/album', { waitUntil: 'networkidle' });
    const metrics = await labMetrics(page);

    expect(metrics.lcp, `Album LCP was ${metrics.lcp.toFixed(0)} ms`).toBeGreaterThan(0);
    expect(metrics.lcp, `Album LCP was ${metrics.lcp.toFixed(0)} ms`).toBeLessThanOrEqual(
      performanceBudget.lab.lcpMs
    );
    expect(metrics.cls, `Album CLS was ${metrics.cls.toFixed(4)}`).toBeLessThanOrEqual(
      performanceBudget.lab.cls
    );
  });
});
