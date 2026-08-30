import { expect, test } from 'vitest'
import { createTicketSchema, ticketFormSchema } from '../src/ticket.ts'

const ticketTypeId = '8d1d285f-9d21-4b42-b218-495b05b4f223'

test('ticket schemas use ticket type identity without a ticket name', () => {
  const input = {
    name: 'Redundant label',
    ticketTypeId,
    price: 1000,
    quantity: 10,
    description: 'Private access',
    status: 'active',
    eventId: 'event-id',
    saleStartsAt: new Date('2026-09-01T20:00:00.000Z'),
    saleEndsAt: new Date('2026-09-01T22:00:00.000Z'),
  }

  const createResult = createTicketSchema.parse(input)
  const formResult = ticketFormSchema.parse({
    ...input,
    price: '1000',
    quantity: '10',
    saleStartsAt: '2026-09-01T20:00:00.000Z',
    saleEndsAt: '2026-09-01T22:00:00.000Z',
  })

  expect('name' in createResult).toBe(false)
  expect('name' in formResult).toBe(false)
})
