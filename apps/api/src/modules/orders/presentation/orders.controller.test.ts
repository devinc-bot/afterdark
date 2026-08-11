import assert from 'node:assert/strict'
import test from 'node:test'
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
    listMyOrdersUseCase as never
  )

  assert.equal(
    await controller.list({ sub: 'buyer-document-id' } as never, { page: 1, limit: 10 }),
    result
  )
  assert.deepEqual(calls, [{ userDocumentId: 'buyer-document-id', query: { page: 1, limit: 10 } }])
})
