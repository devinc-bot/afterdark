import { expect, test } from '@playwright/test'

test('web exposes the public landing page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('main')).toBeVisible()
})
