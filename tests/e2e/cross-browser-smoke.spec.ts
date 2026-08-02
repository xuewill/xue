import { expect, test } from '@playwright/test';

test('core public flow renders and responds without runtime errors', async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.goto('/');
  await expect(page).toHaveTitle(/Will Xue/);
  await expect(page.getByRole('heading', { level: 1, name: 'Will Xue' })).toBeVisible();

  await page.getByRole('link', { name: 'blog', exact: true }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Browse topics' })).toBeVisible();

  await page.goto('/archive');
  await expect(page.getByRole('heading', { level: 1, name: /record of making/ })).toBeVisible();

  await page.goto('/design-system');
  await expect(page.getByRole('heading', { level: 1, name: /Design System/ })).toBeVisible();
  const materialSelect = page.getByRole('combobox', { name: 'Material' });
  await materialSelect.click();
  await expect(page.getByRole('listbox', { name: 'Material' })).toBeVisible();
  await page.getByRole('option', { name: 'Blue mark' }).click();
  await expect(materialSelect).toHaveText('Blue mark');
  await materialSelect.click();
  await materialSelect.press('p');
  await materialSelect.press('Enter');
  await expect(materialSelect).toHaveText('Paper');

  await page.locator('#ds-demo-slider').fill('72');
  await expect(page.locator('#ds-demo-slider')).toHaveValue('72');

  const overviewTab = page.getByRole('tab', { name: 'Overview' });
  await overviewTab.focus();
  await overviewTab.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Notes' })).toHaveAttribute('aria-selected', 'true');

  const motionAccordion = page.getByRole('button', { name: 'How should motion behave?' });
  await motionAccordion.focus();
  await motionAccordion.press('Enter');
  await expect(motionAccordion).toHaveAttribute('aria-expanded', 'true');

  const replayMotion = page.getByRole('button', { name: 'Replay motion sequence' });
  await replayMotion.click();
  await expect(page.locator('.ds-motion-grid')).toHaveAttribute('data-motion-run', '1');
  await expect(page.getByText('Blind emboss', { exact: true })).toBeVisible();
  await expect(page.getByText('Tracing paper', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Page 3' }).click();
  await expect(page.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');

  await page.getByRole('button', { name: 'Show toast' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Saved locally' })).toBeVisible();
  const openDialog = page.getByRole('button', { name: 'Open dialog' });
  await openDialog.click();
  await expect(page.getByRole('dialog', { name: 'A quiet confirmation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(openDialog).toBeFocused();

  await page.goto('/album');
  await page.getByRole('button', { name: /^View image:/ }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.locator('.album-lightbox-close').click();
  await expect(dialog).toBeHidden();

  expect(runtimeErrors).toEqual([]);
});
