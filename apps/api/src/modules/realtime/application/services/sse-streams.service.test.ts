import { expect, test, vi } from 'vitest'

const repositories = vi.hoisted(() => ({
  findDomainOutboxEvents: vi.fn(),
  findPublishedEventAvailabilityByDocumentId: vi.fn(),
  findPurchaseByDocumentIdAndUserId: vi.fn(),
  findUserIdByDocumentId: vi.fn(),
}))

vi.mock('@repo/db', () => repositories)

import { SseStreamsService } from './sse-streams.service.ts'

test('sends an owned purchase snapshot and versioned durable catchup', async () => {
  repositories.findUserIdByDocumentId.mockResolvedValue(3)
  repositories.findPurchaseByDocumentIdAndUserId.mockResolvedValue({
    purchase: {
      documentId: 'purchase-id',
      status: 'pending',
      stateVersion: 0,
      expiresAt: null,
    },
    payment: { status: 'pending' },
  })
  repositories.findDomainOutboxEvents.mockResolvedValueOnce([
    {
      documentId: 'outbox-id',
      aggregateVersion: 1,
      eventType: 'purchase.confirmed',
      payload: { status: 'confirmed' },
    },
  ])

  const events: Array<{ type?: string; data: string | object; id?: string }> = []
  const stream = await new SseStreamsService().createPurchaseStream('buyer-id', 'purchase-id', 0)
  const subscription = stream.subscribe((event) => events.push(event))

  await vi.waitFor(() => expect(events).toHaveLength(2))
  subscription.unsubscribe()

  expect(events).toEqual([
    {
      type: 'snapshot',
      data: {
        purchaseDocumentId: 'purchase-id',
        status: 'pending',
        paymentStatus: 'pending',
        expiresAt: null,
        version: 0,
      },
    },
    {
      type: 'update',
      id: 'outbox-id',
      data: {
        eventType: 'purchase.confirmed',
        version: 1,
        payload: { status: 'confirmed' },
      },
    },
  ])
  expect(repositories.findDomainOutboxEvents).toHaveBeenCalledWith({
    aggregateType: 'purchase',
    aggregateDocumentId: 'purchase-id',
    afterVersion: 0,
  })
})

test('does not open a private stream for a purchase the user does not own', async () => {
  repositories.findUserIdByDocumentId.mockResolvedValue(3)
  repositories.findPurchaseByDocumentIdAndUserId.mockResolvedValue(null)

  await expect(
    new SseStreamsService().createPurchaseStream('buyer-id', 'purchase-id', 0)
  ).rejects.toThrow('Not Found')
})

test('rejects an availability stream for an unpublished event', async () => {
  repositories.findPublishedEventAvailabilityByDocumentId.mockResolvedValue(null)

  await expect(
    new SseStreamsService().createPublishedEventAvailabilityStream('event-id', 0)
  ).rejects.toThrow('Not Found')
})
