import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  QueryFactory,
  QueryFactoryAuthenticationError,
  QueryFactoryError,
} from '../src/lib/query-factory.ts'

const API_URL = 'https://api.example.test/api'
const PROTECTED_PATH = '/api/protected'
const REFRESH_PATH = '/api/auth/refresh'
const LOGIN_PATH = '/api/auth/login'
const LOGOUT_PATH = '/api/auth/logout'

afterEach(() => {
  vi.unstubAllGlobals()
})

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function createFactory(accessToken = 'expired-token') {
  let currentAccessToken = accessToken
  const onRefreshSuccess = vi.fn((nextAccessToken: string) => {
    currentAccessToken = nextAccessToken
  })
  const factory = new QueryFactory(API_URL, {
    getAccessToken: () => currentAccessToken,
    refresh: {
      path: REFRESH_PATH,
      data: { app: 'web' },
      onSuccess: ({ accessToken: nextAccessToken }) => onRefreshSuccess(nextAccessToken),
    },
  })

  return { factory, onRefreshSuccess }
}

describe('QueryFactory refresh', () => {
  test('refreshes once and retries an eligible request with the current access token', async () => {
    const { factory, onRefreshSuccess } = createFactory()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(jsonResponse({ accessToken: 'fresh-token' }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(factory.get<{ ok: boolean }>(PROTECTED_PATH)).resolves.toEqual({ ok: true })

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('Authorization')).toBe(
      'Bearer expired-token'
    )
    expect(fetchMock.mock.calls[1]?.[0]).toBe('https://api.example.test/api/auth/refresh')
    expect(new Headers(fetchMock.mock.calls[2]?.[1]?.headers).get('Authorization')).toBe(
      'Bearer fresh-token'
    )
    expect(onRefreshSuccess).toHaveBeenCalledWith('fresh-token')
  })

  test('shares one refresh across concurrent unauthorized requests', async () => {
    const { factory } = createFactory()
    let resolveRefresh: ((response: Response) => void) | undefined
    const refreshResponse = new Promise<Response>((resolve) => {
      resolveRefresh = resolve
    })
    const fetchMock = vi.fn((url: string) => {
      if (url.endsWith(REFRESH_PATH)) return refreshResponse
      if (fetchMock.mock.calls.filter(([requestUrl]) => requestUrl === url).length <= 2) {
        return Promise.resolve(jsonResponse({ message: 'Unauthorized' }, 401))
      }
      return Promise.resolve(jsonResponse({ ok: true }))
    })
    vi.stubGlobal('fetch', fetchMock)

    const requests = [factory.get(PROTECTED_PATH), factory.get(PROTECTED_PATH)]
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
    resolveRefresh?.(jsonResponse({ accessToken: 'fresh-token' }))

    await expect(Promise.all(requests)).resolves.toEqual([{ ok: true }, { ok: true }])
    expect(fetchMock.mock.calls.filter(([url]) => url.endsWith(REFRESH_PATH))).toHaveLength(1)
  })

  test('retries a late unauthorized request with the token refreshed by another request', async () => {
    const { factory } = createFactory()
    let resolveLateUnauthorized: ((response: Response) => void) | undefined
    let protectedRequestCount = 0
    const fetchMock = vi.fn((url: string) => {
      if (url.endsWith(REFRESH_PATH))
        return Promise.resolve(jsonResponse({ accessToken: 'fresh-token' }))
      protectedRequestCount += 1
      if (protectedRequestCount === 1)
        return Promise.resolve(jsonResponse({ message: 'Unauthorized' }, 401))
      if (protectedRequestCount === 2) {
        return new Promise<Response>((resolve) => {
          resolveLateUnauthorized = resolve
        })
      }
      return Promise.resolve(jsonResponse({ ok: true }))
    })
    vi.stubGlobal('fetch', fetchMock)

    const first = factory.get(PROTECTED_PATH)
    const second = factory.get(PROTECTED_PATH)
    await expect(first).resolves.toEqual({ ok: true })
    resolveLateUnauthorized?.(jsonResponse({ message: 'Unauthorized' }, 401))

    await expect(second).resolves.toEqual({ ok: true })
    expect(fetchMock.mock.calls.filter(([url]) => url.endsWith(REFRESH_PATH))).toHaveLength(1)
  })

  test('removes caller authorization headers from refresh requests', async () => {
    const { factory } = createFactory()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(jsonResponse({ accessToken: 'fresh-token' }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    await factory.get(PROTECTED_PATH, { headers: { Authorization: 'Bearer caller-token' } })

    expect(new Headers(fetchMock.mock.calls[1]?.[1]?.headers).has('Authorization')).toBe(false)
  })

  test.each([LOGIN_PATH, REFRESH_PATH, LOGOUT_PATH])(
    'does not refresh an unauthorized auth request: %s',
    async (path) => {
      const { factory } = createFactory()
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ message: 'Unauthorized' }, 401))
      vi.stubGlobal('fetch', fetchMock)

      await expect(factory.post(path, {})).rejects.toMatchObject({ status: 401 })

      expect(fetchMock).toHaveBeenCalledTimes(1)
    }
  )

  test('does not retry a request after its one retry also returns unauthorized', async () => {
    const { factory } = createFactory()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(jsonResponse({ accessToken: 'fresh-token' }))
      .mockResolvedValueOnce(jsonResponse({ message: 'Unauthorized' }, 401))
    vi.stubGlobal('fetch', fetchMock)

    await expect(factory.get(PROTECTED_PATH)).rejects.toMatchObject({ status: 401 })

    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  test('exposes refresh failure so clients can clear local authentication state', async () => {
    const { factory } = createFactory()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(jsonResponse({ message: 'Refresh invalid' }, 401))
    vi.stubGlobal('fetch', fetchMock)

    try {
      await factory.get(PROTECTED_PATH)
      expect.unreachable('The refresh failure should reject the request')
    } catch (error) {
      expect(error).toBeInstanceOf(QueryFactoryAuthenticationError)
      expect(error).toMatchObject({
        originalError: expect.any(QueryFactoryError),
        refreshError: expect.objectContaining({ status: 401 }),
      })
    }
  })

  test('notifies clients when refresh authentication fails', async () => {
    const onAuthenticationFailure = vi.fn()
    const factory = new QueryFactory(API_URL, {
      getAccessToken: () => 'expired-token',
      onAuthenticationFailure,
      refresh: {
        path: REFRESH_PATH,
        data: { app: 'web' },
        onSuccess: vi.fn(),
      },
    })
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(jsonResponse({ message: 'Refresh invalid' }, 401))
    vi.stubGlobal('fetch', fetchMock)

    await expect(factory.get(PROTECTED_PATH)).rejects.toBeInstanceOf(
      QueryFactoryAuthenticationError
    )

    expect(onAuthenticationFailure).toHaveBeenCalledOnce()
  })

  test('preserves non-authentication errors without refreshing', async () => {
    const { factory } = createFactory()
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ message: 'Unavailable' }, 503))
    vi.stubGlobal('fetch', fetchMock)

    await expect(factory.get(PROTECTED_PATH)).rejects.toMatchObject({
      status: 503,
      body: { message: 'Unavailable' },
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
