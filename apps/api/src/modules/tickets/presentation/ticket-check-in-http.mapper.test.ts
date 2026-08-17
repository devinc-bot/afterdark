import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ConflictException, GoneException, UnprocessableEntityException } from '@nestjs/common'
import { TICKET_CHECK_IN_OUTCOME } from '@repo/types'
import { toTicketCheckInHttpResponse } from './ticket-check-in-http.mapper.ts'

const translate = (code: string) => code

test('returns successful check-in response for 200 controller flow', () => {
  const response = {
    outcome: TICKET_CHECK_IN_OUTCOME.SUCCESS,
    checkedInAt: new Date('2026-08-05T20:00:00.000Z'),
    ticket: { documentId: 'ticket-sold-id', name: 'General', type: 'general' as const },
    event: {
      documentId: 'event-id',
      name: 'Event Flow',
      startsAt: new Date('2026-08-05T21:00:00.000Z'),
    },
    location: { documentId: 'location-id', name: 'Venue' },
    purchaser: {
      documentId: 'user-id',
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: null,
    },
  }

  assert.equal(toTicketCheckInHttpResponse(response, translate), response)
})

test('maps used outcome to 409', () => {
  assert.throws(
    () => toTicketCheckInHttpResponse({ outcome: TICKET_CHECK_IN_OUTCOME.USED }, translate),
    ConflictException
  )
})

test('maps expired outcome to 410', () => {
  assert.throws(
    () => toTicketCheckInHttpResponse({ outcome: TICKET_CHECK_IN_OUTCOME.EXPIRED }, translate),
    GoneException
  )
})

test('maps invalid outcome to 422', () => {
  assert.throws(
    () => toTicketCheckInHttpResponse({ outcome: TICKET_CHECK_IN_OUTCOME.INVALID }, translate),
    UnprocessableEntityException
  )
})
