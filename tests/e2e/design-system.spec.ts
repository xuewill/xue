import { expect, test } from '@playwright/test';

test('package components forward consumer attributes to their root element', async ({ page }) => {
  await page.goto('/design-system');

  const probe = page.locator('[data-webaseui-probe="root-attributes"]');
  await expect(probe).toHaveClass(/webaseui-consumer-class/);
  await expect(probe).toHaveAttribute('aria-keyshortcuts', 'S');
  await expect(probe).toHaveCSS('--webaseui-consumer-probe', '1');
});

test.beforeEach(async ({ page }) => {
  await page.goto('/design-system');
});

test('every aria-controls points at an element that exists', async ({ page }) => {
  const dangling = await page.evaluate(() =>
    [...document.querySelectorAll('[aria-controls]')]
      .map((element) => element.getAttribute('aria-controls') ?? '')
      .filter((id) => id && !document.getElementById(id))
  );

  expect(dangling, `aria-controls without a target: ${dangling.join(', ')}`).toEqual([]);
});

test('exactly one tab panel is visible and its content follows the selection', async ({ page }) => {
  const panels = page.getByRole('tabpanel');
  await expect(panels).toHaveCount(1);

  await page.getByRole('tab', { name: 'Notes' }).click();
  await expect(panels).toHaveCount(1);
  await expect(panels).toContainText('Annotations and decisions');
});

test('the page renders no duplicate element ids', async ({ page }) => {
  const duplicates = await page.evaluate(() => {
    const seen = new Set<string>();
    const repeated = new Set<string>();
    for (const element of document.querySelectorAll('[id]')) {
      if (seen.has(element.id)) repeated.add(element.id);
      seen.add(element.id);
    }
    return [...repeated];
  });

  expect(duplicates, `duplicate ids: ${duplicates.join(', ')}`).toEqual([]);
});

test('escape dismisses the tooltip without moving focus', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Hover or focus' });
  const tooltip = page.locator('[role="tooltip"]');

  await trigger.focus();
  await expect(tooltip).toHaveCSS('opacity', '1');

  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCSS('opacity', '0');
  await expect(trigger).toBeFocused();
});

test('the dialog locks the background and restores focus when it closes', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Open dialog' });
  await trigger.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await expect(page.getByRole('button', { name: 'Close dialog' }).first()).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await expect(trigger).toBeFocused();
});

test('the toast live region is present before the toast appears', async ({ page }) => {
  const liveRegion = page.locator('.ds-toast-live');
  await expect(liveRegion).toBeAttached();
  await expect(liveRegion.locator('.ds-toast')).toHaveCount(0);

  await page.getByRole('button', { name: 'Show toast' }).click();
  await expect(liveRegion.locator('.ds-toast')).toHaveCount(1);
});

test('pointing at the toast pauses its dismiss countdown', async ({ page }) => {
  await page.getByRole('button', { name: 'Show toast' }).click();

  const toast = page.locator('.ds-toast');
  await expect(toast).toBeVisible();
  await toast.hover();

  // Left alone the toast dismisses itself after 4200ms.
  await page.waitForTimeout(5000);
  await expect(toast).toBeVisible();
});

test('the sidebar tracks the reading position while scrolling', async ({ page }) => {
  const active = page.locator('.ds-sidebar nav button.active');
  await expect(active).toHaveText('Overview');

  await page.locator('#motion').scrollIntoViewIfNeeded();
  await expect(active).toHaveText('Motion');
});

/*
 * Behaviour tests for the interactive primitives.
 *
 * These run in Playwright rather than as unit tests because the repository has
 * no component-testing setup, and /design-system already renders every
 * component in a real browser in its real state.
 */

test('the select supports arrow keys, Home/End, and typeahead', async ({ page }) => {
  await page.goto('/design-system');
  const trigger = page.locator('#ds-demo-select');

  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(trigger).toContainText('Ink wash');

  await page.keyboard.press('Enter');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(trigger).toContainText('Blue mark');

  await page.keyboard.press('Enter');
  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  await expect(trigger).toContainText('Paper');

  // Typeahead: "b" should jump to "Blue mark" without opening a native menu.
  await page.keyboard.press('Enter');
  await page.keyboard.press('b');
  await page.keyboard.press('Enter');
  await expect(trigger).toContainText('Blue mark');
});

test('escape closes the select and returns focus to its trigger', async ({ page }) => {
  await page.goto('/design-system');
  const trigger = page.locator('#ds-demo-select');

  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');

  await page.keyboard.press('Escape');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
});

test('the slider steps with arrow keys and clamps at both ends', async ({ page }) => {
  await page.goto('/design-system');
  const slider = page.locator('#ds-demo-slider');

  await slider.focus();
  const start = Number(await slider.inputValue());

  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveValue(String(start + 1));

  await page.keyboard.press('ArrowLeft');
  await expect(slider).toHaveValue(String(start));

  await page.keyboard.press('Home');
  await expect(slider).toHaveValue('0');
  await page.keyboard.press('ArrowLeft');
  await expect(slider, 'must not fall below min').toHaveValue('0');

  await page.keyboard.press('End');
  await expect(slider).toHaveValue('100');
  await page.keyboard.press('ArrowRight');
  await expect(slider, 'must not exceed max').toHaveValue('100');
});

test('pagination clamps at the first and last page', async ({ page }) => {
  await page.goto('/design-system');
  const pager = page.getByRole('navigation', { name: 'Archive pages' });
  // Assert on aria-label, not the button text: pages render zero-padded ("01").
  const current = () => pager.locator('[aria-current="page"]');

  for (let step = 0; step < 6; step += 1) {
    const previous = pager.getByRole('button', { name: /previous/i });
    if (await previous.isEnabled()) await previous.click();
  }
  await expect(current()).toHaveAttribute('aria-label', 'Page 1');

  for (let step = 0; step < 8; step += 1) {
    const next = pager.getByRole('button', { name: /next/i });
    if (await next.isEnabled()) await next.click();
  }
  await expect(current()).toHaveAttribute('aria-label', 'Page 5');
});

test('tabs wrap with arrow keys and jump with Home/End', async ({ page }) => {
  await page.goto('/design-system');
  const tabs = page.getByRole('tab');

  await tabs.first().focus();
  await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');

  // Wrapping backwards from the first tab lands on the last.
  await page.keyboard.press('ArrowLeft');
  await expect(tabs.last()).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('ArrowRight');
  await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('End');
  await expect(tabs.last()).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('Home');
  await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
});
