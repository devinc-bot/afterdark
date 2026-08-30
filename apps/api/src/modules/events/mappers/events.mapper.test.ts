import { expect, test } from 'vitest'
import { EVENT_STATUS } from '@repo/types'
import { toEventUpsertInput } from './events.mapper.ts'

test('maps an event duration to its persisted end timestamp', () => {
  const startsAt = new Date('2026-08-17T22:00:00.000Z')

  const result = toEventUpsertInput(
    {
      locationId: '8d1d285f-9d21-4b42-b218-495b05b4f223',
      name: 'Late show',
      description: 'A late night event',
      startsAt,
      durationHours: 4,
      status: EVENT_STATUS.PUBLISHED,
      faqs: [],
    },
    20,
    10
  )

  expect(result.startsAt).toBe(startsAt)
  expect(result.endsAt.toISOString()).toBe('2026-08-18T02:00:00.000Z')
})
