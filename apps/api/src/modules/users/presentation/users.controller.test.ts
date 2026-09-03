import { expect, test } from 'vitest'
import { UsersController } from './users.controller.ts'

function createController(
  overrides: {
    list?: (...args: never[]) => Promise<unknown>
    get?: (...args: never[]) => Promise<unknown>
    updateStatus?: (...args: never[]) => Promise<unknown>
  } = {}
) {
  const listAdminUsersUseCase = { execute: overrides.list ?? (async () => ({})) }
  const getAdminUserDetailUseCase = { execute: overrides.get ?? (async () => ({})) }
  const updateAdminUserStatusUseCase = { execute: overrides.updateStatus ?? (async () => {}) }
  return {
    controller: new UsersController(
      listAdminUsersUseCase as never,
      getAdminUserDetailUseCase as never,
      updateAdminUserStatusUseCase as never
    ),
    useCases: { listAdminUsersUseCase, getAdminUserDetailUseCase, updateAdminUserStatusUseCase },
  }
}

test('delegates user listing to the use case', async () => {
  const result = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
  const calls: Array<{ query: { page: number; limit: number } }> = []
  const { controller, useCases } = createController({
    list: async (query: { page: number; limit: number }) => {
      calls.push({ query })
      return result
    },
  })

  expect(await controller.list({ page: 1, limit: 10 })).toBe(result)
  expect(calls).toEqual([{ query: { page: 1, limit: 10 } }])
  expect(useCases.listAdminUsersUseCase).toBeTruthy()
})

test('delegates user detail to the use case', async () => {
  const result = { documentId: 'acc-user', email: 'user@example.com' }
  const calls: string[] = []
  const { controller } = createController({
    get: async (documentId: string) => {
      calls.push(documentId)
      return result
    },
  })

  expect(await controller.get('acc-user')).toBe(result)
  expect(calls).toEqual(['acc-user'])
})

test('delegates user status update to the use case', async () => {
  const calls: Array<{ documentId: string; status: string }> = []
  const { controller } = createController({
    updateStatus: async (documentId: string, status: string) => {
      calls.push({ documentId, status })
    },
  })

  await controller.updateStatus('acc-user', { status: 'inactive' })
  expect(calls).toEqual([{ documentId: 'acc-user', status: 'inactive' }])
})
