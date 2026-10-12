import { test, expect } from '@playwright/test';

const configName = 'Playwright CRUD configuration';

test('builder use case: create, update and delete an activity configuration', async ({ page, request }) => {
  // Clean up a previous interrupted run without weakening the UI CRUD demonstration.
  const existing = await request.get('/api/configs');
  for (const config of await existing.json()) {
    if (config.name === configName) await request.delete(`/api/configs/${config.id}`);
  }

  await page.goto('/activities');
  await expect(page.getByRole('heading', { name: 'Activity settings' })).toBeVisible();

  await page.getByLabel('Configuration name').fill(configName);
  await page.getByLabel('Activity type').selectOption('wordle');
  await page.getByLabel('Difficulty').selectOption('easy');
  await page.getByLabel('Words in generated activity').fill('4');
  await page.getByLabel('Phonemes per target').fill('3');
  await page.getByRole('button', { name: 'Create configuration' }).click();

  await expect(page.getByText('Activity configuration created.')).toBeVisible();
  let row = page.getByRole('row', { name: new RegExp(configName) });
  await expect(row).toBeVisible();

  await row.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Words in generated activity').fill('3');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Activity configuration updated.')).toBeVisible();

  row = page.getByRole('row', { name: new RegExp(configName) });
  await expect(row).toContainText('3 targets');

  page.once('dialog', (dialog) => dialog.accept());
  await row.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Activity configuration deleted.')).toBeVisible();
  await expect(page.getByRole('row', { name: new RegExp(configName) })).toHaveCount(0);
});
