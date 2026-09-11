import { beforeEach, expect, test, vi } from 'vitest'

const { setCookie, getCookieSync, deleteCookie } = vi.hoisted(() => ({
  setCookie: vi.fn(),
  getCookieSync: vi.fn(),
  deleteCookie: vi.fn(),
}))

vi.mock('../src/utils/cookies.ts', () => ({
  setCookie,
  getCookieSync,
  deleteCookie,
}))

import { SESSION_DURATION_MS } from '../src/constants/auth-storage.ts'
import { createAuthStorage } from '../src/utils/create-auth-storage.ts'

beforeEach(() => {
  vi.clearAllMocks()
})

test('saveAuthSession writes the access token cookie with the default session duration', () => {
  const storage = createAuthStorage({ cookieName: 'app.web.auth.token' })

  storage.saveAuthSession({ accessToken: 'token-1' })

  expect(setCookie).toHaveBeenCalledWith({
    name: 'app.web.auth.token',
    value: 'token-1',
    maxAgeMs: SESSION_DURATION_MS,
  })
})

test('getAuthSession and getAccessTokenSync read the configured cookie name', () => {
  getCookieSync.mockReturnValue('token-2')
  const storage = createAuthStorage({ cookieName: 'app.admin.auth.token' })

  expect(storage.getAccessTokenSync()).toBe('token-2')
  expect(storage.getAuthSession()).toEqual({ accessToken: 'token-2' })
  expect(getCookieSync).toHaveBeenCalledWith({ name: 'app.admin.auth.token' })
})

test('getAuthSession returns null when the cookie is missing', () => {
  getCookieSync.mockReturnValue(null)
  const storage = createAuthStorage({ cookieName: 'app.dashboard.auth.token' })

  expect(storage.getAuthSession()).toBeNull()
})

test('clearAuthSession deletes the configured cookie', () => {
  const storage = createAuthStorage({ cookieName: 'app.web.auth.token', maxAgeMs: 1000 })

  storage.clearAuthSession()

  expect(deleteCookie).toHaveBeenCalledWith({ name: 'app.web.auth.token' })
})

test('saveAuthSession honors an explicit maxAgeMs override', () => {
  const storage = createAuthStorage({ cookieName: 'app.web.auth.token', maxAgeMs: 5000 })

  storage.saveAuthSession({ accessToken: 'token-3' })

  expect(setCookie).toHaveBeenCalledWith({
    name: 'app.web.auth.token',
    value: 'token-3',
    maxAgeMs: 5000,
  })
})
