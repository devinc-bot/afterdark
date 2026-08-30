import { expect, test } from 'vitest'
import {
  createTicketSchema,
  createTicketTypeSchema,
  ticketTypeDocumentIdSchema,
} from '../src/index.ts'

const TICKET_TYPE_DOCUMENT_ID = '8d1d285f-9d21-4b42-b218-495b05b4f223'

test('ticket type creation trims a valid name and rejects blank names', () => {
  expect(createTicketTypeSchema.parse({ name: '  Backstage  ' }).name).toBe('Backstage')
  expect(createTicketTypeSchema.safeParse({ name: '   ' }).success).toBe(false)
})

test('ticket creation requires a persistent ticket type document id', () => {
  const input = createTicketSchema.safeParse({
    name: 'Entry',
    ticketTypeId: TICKET_TYPE_DOCUMENT_ID,
    price: 1000,
    quantity: 10,
    description: 'Entry description',
    eventId: 'event-id',
  })

  expect(input.success).toBe(true)
  expect(ticketTypeDocumentIdSchema.safeParse('general').success).toBe(false)
})
