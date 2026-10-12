import { test, expect } from '@playwright/test';

test('user use case: generate and view Wordle and Word Search output', async ({ page, request }) => {
  const health = await request.get('/health');
  expect(health.status()).toBe(200);

  await page.goto('/wordle');
  await expect(page.getByRole('heading', { name: 'Phoneme Wordle' })).toBeVisible();
  await page.getByRole('button', { name: 'Preview' }).click();
  await expect(page.getByText('Preview generated from stored database data.')).toBeVisible();
  await expect(page.locator('iframe.previewFrame')).toBeVisible();

  await page.goto('/word-search');
  await expect(page.getByRole('heading', { name: 'Phoneme Word Search' })).toBeVisible();
  await page.getByRole('button', { name: 'Preview' }).click();
  await expect(page.getByText('Preview generated from stored database data.')).toBeVisible();
  await expect(page.locator('iframe.previewFrame')).toBeVisible();

  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Operational dashboard' })).toBeVisible();
  await expect(page.getByText('System healthy')).toBeVisible();
});
