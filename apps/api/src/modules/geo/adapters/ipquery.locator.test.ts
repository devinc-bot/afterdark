import { afterEach, describe, expect, test, vi } from 'vitest'
import { IPQUERY_TIMEOUT_MS, IpQueryLocatorAdapter } from './ipquery.locator.ts'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('IpQueryLocatorAdapter', () => {
  test('aborts an IpQuery request after 1.5 seconds', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn((_url: URL, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(init.signal?.reason))
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const adapter = new IpQueryLocatorAdapter()
    const result = adapter.locateByIp('203.0.113.1')

    await vi.advanceTimersByTimeAsync(IPQUERY_TIMEOUT_MS)

    await expect(result).rejects.toThrow()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
  })
})
