import assert from 'node:assert/strict'
import test from 'node:test'
import {
  EVENT_DURATION_MAX_HOURS,
  EVENT_DURATION_MIN_HOURS,
  createEventSchema,
  eventDetailsFormSchema,
  eventDurationHoursSchema,
} from '../src/index.ts'

test('event duration accepts whole and half-hour values within its range', () => {
  assert.equal(eventDurationHoursSchema.parse(EVENT_DURATION_MIN_HOURS), EVENT_DURATION_MIN_HOURS)
  assert.equal(eventDurationHoursSchema.parse(1.5), 1.5)
  assert.equal(eventDurationHoursSchema.parse(EVENT_DURATION_MAX_HOURS), EVENT_DURATION_MAX_HOURS)
})

test('event duration rejects negative, out-of-range, and unsupported fractions', () => {
  assert.equal(eventDurationHoursSchema.safeParse(-1).success, false)
  assert.equal(eventDurationHoursSchema.safeParse(0).success, false)
  assert.equal(eventDurationHoursSchema.safeParse(72.5).success, false)
  assert.equal(eventDurationHoursSchema.safeParse(1.25).success, false)
})

test('create event parses a duration instead of an end timestamp', () => {
  const result = createEventSchema.parse({
    locationId: '8d1d285f-9d21-4b42-b218-495b05b4f223',
    name: 'Late show',
    description: 'A late night event',
    startsAt: '2026-08-17T22:00:00.000Z',
    durationHours: '4',
  })

  assert.equal(result.durationHours, 4)
  assert.equal('endsAt' in result, false)
})

test('event details form requires a valid duration', () => {
  const result = eventDetailsFormSchema.safeParse({
    name: 'Late show',
    description: 'A late night event',
    startsAt: '2026-08-17T22:00',
    durationHours: '0',
    status: 'published',
  })

  assert.equal(result.success, false)
  assert.equal(result.error?.issues[0]?.path[0], 'durationHours')
})
