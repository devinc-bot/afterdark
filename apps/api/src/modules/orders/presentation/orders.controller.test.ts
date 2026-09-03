import { expect, test } from 'vitest'
import { of } from 'rxjs'
import { OrdersController } from './orders.controller.ts'

test('delegates order history to the current user use case', async () => {
  const calls: Array<{ query: { limit: number; page: number }; userDocumentId: string }> = []
  const result = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
  const listMyOrdersUseCase = {
    execute: async (userDocumentId: string, query: { page: number; limit: number }) => {
      calls.push({ userDocumentId, query })
      return result
    },
  }
  const controller = new OrdersController(
    undefined as never,
    undefined as never,
    listMyOrdersUseCase as never,
    undefined as never,
    undefined as never
  )

  expect(await controller.list({ sub: 'buyer-document-id' } as never, { page: 1, limit: 10 })).toBe(
    result
  )
  expect(calls).toEqual([{ userDocumentId: 'buyer-document-id', query: { page: 1, limit: 10 } }])
})

test('delegates a private purchase stream with the authenticated buyer and catchup version', async () => {
  const calls: Array<{ userDocumentId: string; purchaseDocumentId: string; afterVersion: number }> =
    []
  const stream = of({ data: {} })
  const sseStreamsService = {
    createPurchaseStream: async (
      userDocumentId: string,
      purchaseDocumentId: string,
      afterVersion: number
    ) => {
      calls.push({ userDocumentId, purchaseDocumentId, afterVersion })
      return stream
    },
  }
  const controller = new OrdersController(
    undefined as never,
    undefined as never,
    undefined as never,
    undefined as never,
    sseStreamsService as never
  )

  expect(
    await controller.stream({ sub: 'buyer-document-id' } as never, 'purchase-document-id', '4')
  ).toBe(stream)
  expect(calls).toEqual([
    {
      userDocumentId: 'buyer-document-id',
      purchaseDocumentId: 'purchase-document-id',
      afterVersion: 4,
    },
  ])
})

test('delegates pending order deletion to the current user use case', async () => {
  const calls: Array<{ orderDocumentId: string; userDocumentId: string }> = []
  const deletePendingOrderUseCase = {
    execute: async (userDocumentId: string, orderDocumentId: string) => {
      calls.push({ userDocumentId, orderDocumentId })
    },
  }
  const controller = new OrdersController(
    undefined as never,
    undefined as never,
    undefined as never,
    deletePendingOrderUseCase as never,
    undefined as never
  )

  await controller.delete({ sub: 'buyer-document-id' } as never, 'order-document-id')

  expect(calls).toEqual([
    { userDocumentId: 'buyer-document-id', orderDocumentId: 'order-document-id' },
  ])
})
