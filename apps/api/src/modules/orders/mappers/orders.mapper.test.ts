import { expect, test } from 'vitest'
import type { OrderWithTicketDocumentId } from '@repo/db'
import {
  toBuyerOrderSummaryResponse,
  toBuyerPurchaseSummaryResponse,
  toOrderResponse,
} from './orders.mapper.ts'

test('maps a legacy order response with the ticket document ID', () => {
  const result = toOrderResponse({
    documentId: 'order-1',
    ticketId: 42,
    ticketDocumentId: 'ticket-document-id',
    status: 'pending',
    amount: 2500,
    quantity: 2,
    provider: 'mercado_pago',
    paidAt: null,
    createdAt: new Date(100000),
    updatedAt: new Date(200000),
  } as OrderWithTicketDocumentId)

  expect(result.ticketId).toBe('ticket-document-id')
})

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

test('maps normalized purchases to the compatible order history response', () => {
  const result = toBuyerPurchaseSummaryResponse({
    documentId: 'purchase-1',
    purchaseStatus: 'confirmed',
    paymentStatus: 'approved',
    amount: 2500,
    quantity: 2,
    provider: 'mercado_pago',
    paidAt: new Date(100000),
    createdAt: new Date(100000),
    updatedAt: new Date(200000),
    ticketId: 'ticket-document-id',
    ticketType: { documentId: 'type-general', name: 'General' },
    eventId: 'event-document-id',
    eventName: 'After party',
    eventStartsAt: new Date(1000000),
  })

  expect(result.status).toBe('completed')
  expect(result.ticketId).toBe('ticket-document-id')
})
