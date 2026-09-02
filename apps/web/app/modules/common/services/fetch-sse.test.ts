import { describe, expect, test, vi } from 'vitest'
import { isNewerSseVersion, parseSseEventBlock, subscribeToSse } from './fetch-sse'

test('only accepts monotonic stream versions', () => {
  expect(isNewerSseVersion(3, 2)).toBe(true)
  expect(isNewerSseVersion(2, 2)).toBe(false)
  expect(isNewerSseVersion(1, 2)).toBe(false)
})

describe('parseSseEventBlock', () => {
  test('parses named JSON events and ignores comments', () => {
    expect(
      parseSseEventBlock(
        ': heartbeat\nevent: snapshot\nid: event-1\ndata: {"version":2,\ndata: "status":"pending"}'
      )
    ).toEqual({
      type: 'snapshot',
      id: 'event-1',
      data: { version: 2, status: 'pending' },
    })
  })
})

describe('subscribeToSse', () => {
  test('reconnects using the latest monotonic version', async () => {
    let latestVersion = 0
    let subscription: ReturnType<typeof subscribeToSse>
    let resolveSecondRequest: (() => void) | undefined
    const secondRequest = new Promise<void>((resolve) => {
      resolveSecondRequest = resolve
    })
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response('event: snapshot\ndata: {"version":2}\n\n', { status: 200 })
      )
      .mockImplementationOnce(async () => {
        resolveSecondRequest?.()
        subscription.unsubscribe()
        return new Response(null, { status: 200 })
      })

    subscription = subscribeToSse({
      getUrl: () => `https://example.test/events?afterVersion=${latestVersion}`,
      onEvent: (event) => {
        latestVersion = (event.data as { version: number }).version
      },
      reconnectDelayMs: 0,
      fetchFn,
    })

    await secondRequest

    expect(fetchFn.mock.calls.map(([url]) => url)).toEqual([
      'https://example.test/events?afterVersion=0',
      'https://example.test/events?afterVersion=2',
    ])
  })
})
