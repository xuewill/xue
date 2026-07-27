import { expect, test, type Locator } from '@playwright/test';

async function expectMinimumTarget(locator: Locator, minimum = 44) {
  const box = await locator.boundingBox();
  expect(box, 'interactive target should have a rendered box').not.toBeNull();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(minimum);
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(minimum);
}

test('album lightbox traps focus and restores it to the active photo', async ({ page }) => {
  await page.goto('/album');

  const trigger = page.locator('.album-trigger').first();
  await trigger.focus();
  await page.keyboard.press('Enter');

  const dialog = page.locator('dialog.album-lightbox');
  const closeButton = page.locator('.album-lightbox-close');
  const previousButton = page.locator('.album-lightbox-prev');

  await expect(dialog).toBeVisible();
  await expect(closeButton).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(previousButton).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(closeButton).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('keyboard sketchbook navigation updates without the physical page-turn animation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');

  const caption = page.locator('.sb-captions > .sb-caption:not(.cap-out)');
  const previousCaption = await caption.textContent();

  await page.keyboard.press('ArrowRight');

  await expect(page.locator('.sb-flap')).toHaveCount(0);
  await expect(caption).not.toHaveText(previousCaption ?? '');
});

test('pointer sketchbook navigation keeps the production page-turn animation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');

  const caption = page.locator('.sb-captions > .sb-caption:not(.cap-out)');
  await expect(caption).toHaveText('Stanford', { timeout: 6_000 });

  await page.locator('.sb-zone.sb-next').click();

  const flap = page.locator('.sb-flap.next');
  await expect(flap).toHaveCount(1);
  await expect(flap).toHaveCSS('animation-name', 'sb-fold-next');
  await expect(flap).toHaveCSS('animation-duration', '0.85s');
  await expect(flap).toHaveCount(0, { timeout: 2_000 });
});

test('email links avoid Cloudflare markup rewriting while preserving the address', async ({
  page,
  request
}) => {
  const response = await request.get('/');
  const serverHtml = await response.text();

  expect(serverHtml).not.toContain('willxue@msn.com');
  expect(serverHtml).not.toContain('mailto:');

  await page.goto('/');
  const renderedHtml = await page.content();

  const emailItem = page.locator('.social-item').filter({
    has: page.getByRole('link', { name: 'Email', exact: true })
  });

  expect(renderedHtml).not.toContain('willxue@msn.com');
  expect(renderedHtml).not.toContain('mailto:willxue@msn.com');
  await expect(emailItem.getByRole('link', { name: 'Email', exact: true })).toHaveAttribute(
    'href',
    'mailto:willxue%40msn.com'
  );
  await expect(emailItem.locator('.envelope-address')).toHaveText('To willxue@msn.com');
  await expect(emailItem.locator('.preview-action')).toHaveAttribute(
    'href',
    'mailto:willxue%40msn.com'
  );
});

test('desktop sketchbook intro replays on each page load', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');

  const caption = page.locator('.sb-captions > .sb-caption:not(.cap-out)');
  await expect(caption).toHaveText('Stanford', { timeout: 6_000 });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(caption).not.toHaveText('Stanford', { timeout: 1_000 });
  await expect(caption).toHaveText('Stanford', { timeout: 6_000 });
});

test('client navigation does not replay the initial page entrance', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveAttribute('data-initial-load', '', { timeout: 1_000 });

  await page.locator('.top nav > a[href="/blog"]').click();
  await expect(page.locator('main.page')).toHaveCSS('animation-name', 'none');
});

test.describe('mobile touch interface', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('header divider is visually centered between album and the theme icon', async ({ page }) => {
    await page.goto('/');

    const alignment = await page.evaluate(() => {
      const album = [...document.querySelectorAll<HTMLAnchorElement>('.top nav > a')].find(
        (link) => link.textContent?.trim().toLowerCase() === 'album'
      );
      const theme = document.querySelector<HTMLElement>('.theme-toggle');
      const icon = [...document.querySelectorAll<SVGElement>('.theme-icon')].find(
        (candidate) => getComputedStyle(candidate).display !== 'none'
      );

      if (!album?.firstChild || !theme || !icon) return null;

      const textRange = document.createRange();
      textRange.selectNodeContents(album);
      const albumText = textRange.getBoundingClientRect();
      const iconRect = icon.getBoundingClientRect();
      const themeRect = theme.getBoundingClientRect();
      const divider = getComputedStyle(theme, '::before');
      const transformMatch = divider.transform.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,([^,]+),/);
      const transformX = transformMatch ? Number.parseFloat(transformMatch[1]) : 0;
      const dividerCenter =
        themeRect.left + Number.parseFloat(divider.left) + transformX + Number.parseFloat(divider.width) / 2;

      return {
        dividerCenter,
        visibleGapCenter: (albumText.right + iconRect.left) / 2
      };
    });

    expect(alignment).not.toBeNull();
    expect(Math.abs((alignment?.dividerCenter ?? 0) - (alignment?.visibleGapCenter ?? 0))).toBeLessThan(1);
  });

  test('sketchbook intro visibly flips through the pages on mobile', async ({ page }) => {
    await page.goto('/');

    const sketchbook = page.locator('.sb-wrap');
    await expect(page.locator('.sb-wrap.intro .sb-flap')).toHaveCount(1, { timeout: 4_000 });
    await expect(sketchbook).not.toHaveClass(/intro/, { timeout: 4_000 });
    await expect(page.locator('.sb-captions > .sb-caption:not(.cap-out)')).toHaveText('Stanford');
  });

  test('primary controls meet the 44px touch target baseline', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible();

    await expectMinimumTarget(page.locator('.top .name'));
    const navTargets = page.locator('.top nav > a, .top nav > .menu > a, .theme-toggle');
    for (let index = 0; index < (await navTargets.count()); index += 1) {
      await expectMinimumTarget(navTargets.nth(index));
    }

    const themeToggle = page.locator('.theme-toggle');
    await themeToggle.focus();
    await expect(themeToggle).toHaveCSS('outline-style', 'solid');
    await expect(themeToggle).toHaveCSS('outline-width', '2px');

    const socialLinks = page.locator('.social-link');
    for (let index = 0; index < (await socialLinks.count()); index += 1) {
      await expectMinimumTarget(socialLinks.nth(index));
    }

    await page.goto('/blog/markdown-format-showcase');
    await expectMinimumTarget(page.locator('.toc-trigger'));

    await page.goto('/album');
    await expect(page.getByRole('heading', { level: 1, name: 'Album' })).toBeVisible();
    await page.locator('.album-trigger').first().click();
    await expectMinimumTarget(page.locator('.album-lightbox-close'));

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('social previews can be opened without following the link', async ({ page }) => {
    await page.goto('/');

    const githubItem = page
      .locator('.social-item')
      .filter({ has: page.getByRole('link', { name: 'GitHub', exact: true }) });
    const githubLink = githubItem.getByRole('link', { name: 'GitHub', exact: true });

    await expect(githubLink).toHaveAttribute('aria-expanded', 'false');
    await githubLink.click();

    await expect(page).toHaveURL(/\/$/);
    await expect(githubLink).toHaveAttribute('aria-expanded', 'true');
    await expect(githubItem.locator('.social-preview')).toBeVisible();
    await expect(githubItem.getByRole('link', { name: /Open GitHub/i })).toBeVisible();

    await page.locator('.footer-copyright').click();
    await expect(githubLink).toHaveAttribute('aria-expanded', 'false');
  });

  test('home dropdown is reachable by touch', async ({ page }) => {
    await page.goto('/');

    const homeLink = page.locator('.menu > a');
    const dropdown = page.locator('#home-dropdown');

    await homeLink.click();
    await expect(homeLink).toHaveAttribute('aria-expanded', 'true');
    await expect(dropdown).toBeVisible();

    await page.locator('.footer-copyright').click();
    await expect(homeLink).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('reduced motion', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test('removes movement while retaining useful color transitions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    await expect(page.locator('.hero-down')).toHaveCSS('animation-name', 'none');
    await expect(page.locator('body')).not.toHaveCSS('transition-duration', '0.001ms');

    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('.sb-flap')).toHaveCount(0);
  });
});
