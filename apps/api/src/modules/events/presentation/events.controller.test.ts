import { expect, test } from 'vitest'
import { of } from 'rxjs'
import { EventsController } from './events.controller.ts'

test('delegates published-event availability streaming with durable catchup version', async () => {
  const calls: Array<{ eventDocumentId: string; afterVersion: number }> = []
  const stream = of({ data: {} })
  const sseStreamsService = {
    createPublishedEventAvailabilityStream: async (
      eventDocumentId: string,
      afterVersion: number
    ) => {
      calls.push({ eventDocumentId, afterVersion })
      return stream
    },
  }
  const controller = new EventsController(
    undefined as never,
    undefined as never,
    undefined as never,
    undefined as never,
    undefined as never,
    undefined as never,
    undefined as never,
    sseStreamsService as never
  )

  expect(await controller.streamPublishedAvailability('event-document-id', '7')).toBe(stream)
  expect(calls).toEqual([{ eventDocumentId: 'event-document-id', afterVersion: 7 }])
})
