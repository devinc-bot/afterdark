import { expect, test } from 'vitest'
import { toBuyerOrderSummaryResponse } from './orders.mapper.ts'

test('maps a buyer order summary row to its public response', () => {
  const result = toBuyerOrderSummaryResponse({
    documentId: 'order-1',
    status: 'pending',
    amount: 2500,
    quantity: 2,
    provider: 'mercado_pago',
    paidAt: null,
    createdAt: new Date(100000),
    updatedAt: new Date(200000),
    ticketId: 'ticket-1',
    ticketType: { documentId: 'type-general', name: 'General' },
    eventId: 'event-1',
    eventName: 'After party',
    eventStartsAt: new Date(1000000),
  })

  expect(result).toEqual({
    documentId: 'order-1',
    status: 'pending',
    amount: 2500,
    quantity: 2,
    provider: 'mercado_pago',
    paidAt: null,
    createdAt: new Date(100000),
    updatedAt: new Date(200000),
    ticketId: 'ticket-1',
    ticketType: { documentId: 'type-general', name: 'General' },
    eventId: 'event-1',
    eventName: 'After party',
    eventStartsAt: new Date(1000000),
  })
})
