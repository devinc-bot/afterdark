import { expect, test } from 'vitest'
import {
  EVENT_DURATION_MAX_HOURS,
  EVENT_DURATION_MIN_HOURS,
  createEventSchema,
  eventDetailsFormSchema,
  eventDurationHoursSchema,
} from '../src/index.ts'

test('event duration accepts whole and half-hour values within its range', () => {
  expect(eventDurationHoursSchema.parse(EVENT_DURATION_MIN_HOURS)).toBe(EVENT_DURATION_MIN_HOURS)
  expect(eventDurationHoursSchema.parse(1.5)).toBe(1.5)
  expect(eventDurationHoursSchema.parse(EVENT_DURATION_MAX_HOURS)).toBe(EVENT_DURATION_MAX_HOURS)
})

test('event duration rejects negative, out-of-range, and unsupported fractions', () => {
  expect(eventDurationHoursSchema.safeParse(-1).success).toBe(false)
  expect(eventDurationHoursSchema.safeParse(0).success).toBe(false)
  expect(eventDurationHoursSchema.safeParse(72.5).success).toBe(false)
  expect(eventDurationHoursSchema.safeParse(1.25).success).toBe(false)
})

test('create event parses a duration instead of an end timestamp', () => {
  const result = createEventSchema.parse({
    locationId: '8d1d285f-9d21-4b42-b218-495b05b4f223',
    name: 'Late show',
    description: 'A late night event',
    startsAt: '2026-08-17T22:00:00.000Z',
    durationHours: '4',
  })

  expect(result.durationHours).toBe(4)
  expect('endsAt' in result).toBe(false)
})

test('event details form requires a valid duration', () => {
  const result = eventDetailsFormSchema.safeParse({
    name: 'Late show',
    description: 'A late night event',
    startsAt: '2026-08-17T22:00',
    durationHours: '0',
    status: 'published',
  })

  expect(result.success).toBe(false)
  expect(result.error?.issues[0]?.path[0]).toBe('durationHours')
})
