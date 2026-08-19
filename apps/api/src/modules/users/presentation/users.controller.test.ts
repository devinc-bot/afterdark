import assert from 'node:assert/strict'
import test from 'node:test'
import { UsersController } from './users.controller.ts'

test('delegates user listing to the use case', async () => {
  const calls: Array<{ query: { page: number; limit: number } }> = []
  const result = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
  const listAdminUsersUseCase = {
    execute: async (query: { page: number; limit: number }) => {
      calls.push({ query })
      return result
    },
  }
  const updateAdminUserStatusUseCase = { execute: async () => {} }
  const controller = new UsersController(
    listAdminUsersUseCase as never,
    updateAdminUserStatusUseCase as never
  )

  assert.equal(await controller.list({ page: 1, limit: 10 }), result)
  assert.deepEqual(calls, [{ query: { page: 1, limit: 10 } }])
})

test('delegates user status update to the use case', async () => {
  const calls: Array<{ documentId: string; status: string }> = []
  const updateAdminUserStatusUseCase = {
    execute: async (documentId: string, status: string) => {
      calls.push({ documentId, status })
    },
  }
  const listAdminUsersUseCase = { execute: async () => ({}) }
  const controller = new UsersController(
    listAdminUsersUseCase as never,
    updateAdminUserStatusUseCase as never
  )

  await controller.updateStatus('acc-user', { status: 'inactive' })
  assert.deepEqual(calls, [{ documentId: 'acc-user', status: 'inactive' }])
})
