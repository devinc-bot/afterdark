import { expect, test } from 'vitest'
import { ConflictException, GoneException, UnprocessableEntityException } from '@nestjs/common'
import { TICKET_CHECK_IN_OUTCOME } from '@repo/types'
import { toTicketCheckInHttpResponse } from './ticket-check-in-http.mapper.ts'

const translate = (code: string) => code

test('returns successful check-in response for 200 controller flow', () => {
  const response = {
    outcome: TICKET_CHECK_IN_OUTCOME.SUCCESS,
    checkedInAt: new Date('2026-08-05T20:00:00.000Z'),
    ticket: {
      documentId: 'ticket-sold-id',
      ticketType: { documentId: 'type-general', name: 'General' },
    },
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

  expect(toTicketCheckInHttpResponse(response, translate)).toBe(response)
})

test('maps used outcome to 409', () => {
  expect(() =>
    toTicketCheckInHttpResponse({ outcome: TICKET_CHECK_IN_OUTCOME.USED }, translate)
  ).toThrow(ConflictException)
})

test('maps expired outcome to 410', () => {
  expect(() =>
    toTicketCheckInHttpResponse({ outcome: TICKET_CHECK_IN_OUTCOME.EXPIRED }, translate)
  ).toThrow(GoneException)
})

test('maps invalid outcome to 422', () => {
  expect(() =>
    toTicketCheckInHttpResponse({ outcome: TICKET_CHECK_IN_OUTCOME.INVALID }, translate)
  ).toThrow(UnprocessableEntityException)
})
