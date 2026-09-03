import { expect, test } from '@playwright/test'

test('admin exposes the guest login route', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('main')).toBeVisible({ timeout: 15_000 })
})
