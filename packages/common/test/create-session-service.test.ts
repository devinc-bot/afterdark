import { beforeEach, expect, test, vi } from 'vitest'
import { CLIENT_APP } from '@repo/types'
import { QueryFactoryAuthenticationError, QueryFactoryError } from '../src/lib/query-factory.ts'
import { SessionFetchError, createSessionService } from '../src/utils/create-session-service.ts'

const api = {
  get: vi.fn(),
  post: vi.fn(),
}

const clearAuthSession = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

function createService() {
  return createSessionService({
    api,
    app: CLIENT_APP.WEB,
    clearAuthSession,
    messages: {
      expired: () => 'session expired',
      loadFallback: () => 'load failed',
    },
  })
}

test('fetchSession returns the /me payload', async () => {
  const session = { documentId: 'user-1' }
  api.get.mockResolvedValue(session)

  await expect(createService().fetchSession()).resolves.toEqual(session)
  expect(api.get).toHaveBeenCalledWith('/api/session/me')
})

test('fetchSession clears auth and throws SessionFetchError on 401', async () => {
  api.get.mockRejectedValue(new QueryFactoryError(401, 'unauthorized'))

  await expect(createService().fetchSession()).rejects.toEqual(
    new SessionFetchError('session expired', 401)
  )
  expect(clearAuthSession).toHaveBeenCalledOnce()
})

test('fetchSession clears auth on QueryFactoryAuthenticationError', async () => {
  const original = new QueryFactoryError(401, 'unauthorized')
  const refresh = new QueryFactoryError(401, 'refresh failed')
  api.get.mockRejectedValue(new QueryFactoryAuthenticationError(original, refresh))

  await expect(createService().fetchSession()).rejects.toBeInstanceOf(SessionFetchError)
  expect(clearAuthSession).toHaveBeenCalledOnce()
})

test('refreshAuthSession and logoutAuthSession post the configured app', async () => {
  api.post.mockResolvedValue({ accessToken: 'next' })
  const service = createService()

  await service.refreshAuthSession()
  await service.logoutAuthSession()

  expect(api.post).toHaveBeenNthCalledWith(1, '/api/auth/refresh', { app: CLIENT_APP.WEB })
  expect(api.post).toHaveBeenNthCalledWith(2, '/api/auth/logout', { app: CLIENT_APP.WEB })
})
