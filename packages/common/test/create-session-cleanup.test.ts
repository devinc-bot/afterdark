import { expect, test, vi } from 'vitest'
import { createSessionCleanup } from '../src/utils/create-session-cleanup.ts'

test('clearLocalSession clears auth cookies and the registered store cleanup', () => {
  const clearAuthSession = vi.fn()
  const clearStore = vi.fn()
  const cleanup = createSessionCleanup({ clearAuthSession })

  cleanup.registerSessionStateCleanup(clearStore)
  cleanup.clearLocalSession()

  expect(clearAuthSession).toHaveBeenCalledOnce()
  expect(clearStore).toHaveBeenCalledOnce()
})

test('clearLocalSession still clears auth when no store cleanup is registered', () => {
  const clearAuthSession = vi.fn()
  const cleanup = createSessionCleanup({ clearAuthSession })

  cleanup.clearLocalSession()

  expect(clearAuthSession).toHaveBeenCalledOnce()
})
