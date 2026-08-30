import { EVENT_STATUS, type EventResponse } from '@repo/types'
import { expect, test } from 'vitest'
import { eventResponseToFormValues } from '../app/modules/events/utils/event-form.mapper.ts'

function createEventResponse(startsAt: string, endsAt: string): EventResponse {
  return {
    documentId: 'event-one',
    locationId: 'location-one',
    locationName: 'Location One',
    name: 'Event One',
    description: 'Description',
    startsAt: new Date(startsAt),
    endsAt: new Date(endsAt),
    status: EVENT_STATUS.PUBLISHED,
    images: [],
    faqs: [],
    createdAt: new Date(startsAt),
    updatedAt: new Date(startsAt),
  }
}

test('maps an event schedule to its duration input value', () => {
  const values = eventResponseToFormValues(
    createEventResponse('2026-08-17T22:00:00.000Z', '2026-08-18T02:00:00.000Z')
  )

  expect(values.durationHours).toBe('4')
})

test('leaves an out-of-range event duration unselected', () => {
  const values = eventResponseToFormValues(
    createEventResponse('2026-08-17T22:00:00.000Z', '2026-08-21T22:00:00.000Z')
  )

  expect(values.durationHours).toBe('')
})
