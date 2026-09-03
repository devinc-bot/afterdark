import { expect, test } from '@playwright/test'

test('dashboard exposes the guest landing page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('status')).toBeVisible()
})
