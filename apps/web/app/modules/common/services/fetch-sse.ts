const SSE_EVENT_TYPE = {
  MESSAGE: 'message',
} as const

const SSE_FIELD = {
  DATA: 'data',
  EVENT: 'event',
  ID: 'id',
} as const

const SSE_RECONNECT_DELAY_MS = 1000

export type SseEvent = {
  type: string
  id?: string
  data: unknown
}

type FetchSseOptions = {
  getUrl: () => string
  getHeaders?: () => HeadersInit
  onEvent: (event: SseEvent) => void
  onConnectionChange?: (isConnected: boolean) => void
  reconnectDelayMs?: number
  fetchFn?: typeof fetch
}

export type SseSubscription = {
  unsubscribe: () => void
}

export function isNewerSseVersion(version: number, latestVersion: number): boolean {
  return version > latestVersion
}

export function parseSseEventBlock(block: string): SseEvent | null {
  const fields = block.split(/\r?\n/)
  const dataLines: string[] = []
  let type: string = SSE_EVENT_TYPE.MESSAGE
  let id: string | undefined

  for (const field of fields) {
    if (field.length === 0 || field.startsWith(':')) continue

    const separatorIndex = field.indexOf(':')
    const name = separatorIndex === -1 ? field : field.slice(0, separatorIndex)
    const value = separatorIndex === -1 ? '' : field.slice(separatorIndex + 1).trimStart()

    if (name === SSE_FIELD.DATA) dataLines.push(value)
    if (name === SSE_FIELD.EVENT) type = value
    if (name === SSE_FIELD.ID) id = value
  }

  if (dataLines.length === 0) return null

  const dataText = dataLines.join('\n')
  try {
    return { type, ...(id ? { id } : {}), data: JSON.parse(dataText) as unknown }
  } catch {
    return null
  }
}

async function consumeSseResponse(response: Response, onEvent: (event: SseEvent) => void) {
  if (!response.body) throw new Error('SSE response did not include a readable body')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value, { stream: !done })

    let separatorIndex = buffer.search(/\r?\n\r?\n/)
    while (separatorIndex !== -1) {
      const block = buffer.slice(0, separatorIndex)
      const separatorLength = buffer[separatorIndex] === '\r' ? 4 : 2
      buffer = buffer.slice(separatorIndex + separatorLength)
      const event = parseSseEventBlock(block)
      if (event) onEvent(event)
      separatorIndex = buffer.search(/\r?\n\r?\n/)
    }

    if (done) return
  }
}

function waitForReconnect(delayMs: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, delayMs)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout)
        resolve()
      },
      { once: true }
    )
  })
}

/** Uses fetch so authenticated streams can send the Bearer token EventSource cannot attach. */
export function subscribeToSse({
  getUrl,
  getHeaders,
  onEvent,
  onConnectionChange,
  reconnectDelayMs = SSE_RECONNECT_DELAY_MS,
  fetchFn = fetch,
}: FetchSseOptions): SseSubscription {
  const controller = new AbortController()

  const run = async () => {
    while (!controller.signal.aborted) {
      try {
        const response = await fetchFn(getUrl(), {
          method: 'GET',
          credentials: 'include',
          headers: getHeaders?.(),
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`SSE request failed with status ${response.status}`)

        onConnectionChange?.(true)
        await consumeSseResponse(response, onEvent)
      } catch {
        // The polling query remains authoritative while a stream cannot be maintained.
      }

      onConnectionChange?.(false)
      if (!controller.signal.aborted) await waitForReconnect(reconnectDelayMs, controller.signal)
    }
  }

  void run()
  return { unsubscribe: () => controller.abort() }
}
