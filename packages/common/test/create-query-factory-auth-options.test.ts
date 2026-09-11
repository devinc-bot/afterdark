import { expect, test, vi } from 'vitest'
import { CLIENT_APP } from '@repo/types'
import { createQueryFactoryAuthOptions } from '../src/utils/create-query-factory-auth-options.ts'

test('includes refresh wiring for client apps with the configured CLIENT_APP', () => {
  const saveAuthSession = vi.fn()
  const clearLocalSession = vi.fn()
  const options = createQueryFactoryAuthOptions({
    app: CLIENT_APP.DASHBOARD,
    getAccessToken: () => 'token',
    saveAuthSession,
    clearLocalSession,
    isSsr: false,
  })

  expect(options.getAccessToken?.()).toBe('token')
  expect(options.onAuthenticationFailure).toBe(clearLocalSession)
  expect(options.refresh).toEqual({
    path: '/api/auth/refresh',
    data: { app: CLIENT_APP.DASHBOARD },
    onSuccess: saveAuthSession,
  })
})

test('omits refresh wiring under SSR', () => {
  const options = createQueryFactoryAuthOptions({
    app: CLIENT_APP.WEB,
    getAccessToken: () => null,
    saveAuthSession: vi.fn(),
    clearLocalSession: vi.fn(),
    isSsr: true,
  })

  expect(options.refresh).toBeUndefined()
  expect(options.getAccessToken?.()).toBeNull()
})
