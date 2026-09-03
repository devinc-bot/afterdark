import { expect, test, vi } from 'vitest'

const repositories = vi.hoisted(() => ({
  findOrdersPaginatedByUserDocumentId: vi.fn(),
  findPurchasesPaginatedByUserDocumentId: vi.fn(),
}))

vi.mock('@repo/db', () => repositories)

import { ListMyOrdersUseCase } from './list-my-orders.use-case.ts'

test('combines normalized and legacy history before applying compatible pagination', async () => {
  repositories.findPurchasesPaginatedByUserDocumentId.mockResolvedValue({
    rows: [
      purchase('purchase-new', 40),
      purchase('legacy-order', 30),
      purchase('purchase-old', 20),
    ],
    total: 3,
  })
  repositories.findOrdersPaginatedByUserDocumentId.mockResolvedValue({
    rows: [legacyOrder('legacy-order', 30), legacyOrder('legacy-old', 10)],
    total: 2,
  })
  const useCase = new ListMyOrdersUseCase({ translateError: (code: string) => code } as never)

  const result = await useCase.execute('buyer-1', { page: 2, limit: 2 })

  expect(result).toMatchObject({
    total: 4,
    page: 2,
    limit: 2,
    totalPages: 2,
    data: [{ documentId: 'purchase-old' }, { documentId: 'legacy-old' }],
  })
  expect(repositories.findPurchasesPaginatedByUserDocumentId).toHaveBeenCalledWith({
    userDocumentId: 'buyer-1',
    page: 2,
    limit: 2,
  })
  expect(repositories.findOrdersPaginatedByUserDocumentId).toHaveBeenCalledWith({
    userDocumentId: 'buyer-1',
    page: 2,
    limit: 2,
  })
})

function purchase(documentId: string, createdAt: number) {
  return {
    documentId,
    purchaseStatus: 'confirmed',
    paymentStatus: 'approved',
    amount: 2500,
    quantity: 1,
    provider: 'mercado_pago',
    paidAt: new Date(createdAt),
    createdAt: new Date(createdAt),
    updatedAt: new Date(createdAt),
    ticketId: 'ticket-document-id',
    ticketType: { documentId: 'type-general', name: 'General' },
    eventId: 'event-document-id',
    eventName: 'After party',
    eventStartsAt: new Date(createdAt),
  }
}

function legacyOrder(documentId: string, createdAt: number) {
  return {
    documentId,
    status: 'completed',
    amount: 2500,
    quantity: 1,
    provider: 'mercado_pago',
    paidAt: new Date(createdAt),
    createdAt: new Date(createdAt),
    updatedAt: new Date(createdAt),
    ticketId: 'ticket-document-id',
    ticketType: { documentId: 'type-general', name: 'General' },
    eventId: 'event-document-id',
    eventName: 'After party',
    eventStartsAt: new Date(createdAt),
  }
}
