import { expect, test, vi } from 'vitest'

const state = vi.hoisted(() => ({
  rows: [] as Array<Record<string, unknown>>,
  total: 0,
  fail: false,
  lastParams: null as Record<string, unknown> | null,
}))

vi.mock('@repo/db', () => ({
  findAccountsWithRolePaginated: async (params: Record<string, unknown>) => {
    state.lastParams = params
    if (state.fail) throw new Error('db down')
    return { rows: state.rows, total: state.total }
  },
}))

import { ListAdminUsersUseCase } from './list-admin-users.use-case.ts'

function createUseCase() {
  return new ListAdminUsersUseCase({ translateError: (code: string) => code } as never)
}

function resetState() {
  state.rows = []
  state.total = 0
  state.fail = false
  state.lastParams = null
}

test('maps repository rows to admin user list responses with pagination metadata', async () => {
  resetState()
  state.rows = [
    {
      documentId: 'acc-user',
      email: 'alice@example.com',
      createdAt: new Date('2026-08-18T10:00:00.000Z'),
      roleName: 'user',
      userName: 'Alice',
      userLastName: 'Smith',
      ownerName: null,
      ownerLastName: null,
      staffName: null,
      staffLastName: null,
      userStatus: 'active',
      ownerStatus: null,
      staffStatus: null,
    },
    {
      documentId: 'acc-admin',
      email: 'admin@example.com',
      createdAt: new Date('2026-08-17T10:00:00.000Z'),
      roleName: 'admin',
      userName: null,
      userLastName: null,
      ownerName: null,
      ownerLastName: null,
      staffName: null,
      staffLastName: null,
      userStatus: null,
      ownerStatus: null,
      staffStatus: null,
    },
  ]
  state.total = 25

  const useCase = await createUseCase()
  const result = await useCase.execute({ page: 2, limit: 10 })

  expect(result.total).toBe(25)
  expect(result.page).toBe(2)
  expect(result.limit).toBe(10)
  expect(result.totalPages).toBe(3)
  expect(result.data).toEqual([
    {
      documentId: 'acc-user',
      email: 'alice@example.com',
      name: 'Alice',
      lastName: 'Smith',
      role: 'user',
      status: 'active',
      createdAt: '2026-08-18T10:00:00.000Z',
    },
    {
      documentId: 'acc-admin',
      email: 'admin@example.com',
      name: null,
      lastName: null,
      role: 'admin',
      status: null,
      createdAt: '2026-08-17T10:00:00.000Z',
    },
  ])
})

test('resolves owner name when the account has an owner profile', async () => {
  resetState()
  state.rows = [
    {
      documentId: 'acc-owner',
      email: 'owner@example.com',
      createdAt: new Date('2026-08-18T11:00:00.000Z'),
      roleName: 'owner',
      userName: null,
      userLastName: null,
      ownerName: 'Olivia',
      ownerLastName: 'Owner',
      staffName: null,
      staffLastName: null,
      userStatus: null,
      ownerStatus: 'inactive',
      staffStatus: null,
    },
  ]
  state.total = 1

  const useCase = await createUseCase()
  const result = await useCase.execute({ page: 1, limit: 10 })

  expect(result.data[0]).toEqual({
    documentId: 'acc-owner',
    email: 'owner@example.com',
    name: 'Olivia',
    lastName: 'Owner',
    role: 'owner',
    status: 'inactive',
    createdAt: '2026-08-18T11:00:00.000Z',
  })
})

test('passes email and role filters through to the repository', async () => {
  resetState()
  state.total = 0

  const useCase = await createUseCase()
  await useCase.execute({
    page: 1,
    limit: 10,
    email: 'alice',
    role: 'staff',
  })

  expect(state.lastParams).toEqual({
    page: 1,
    limit: 10,
    email: 'alice',
    role: 'staff',
  })
})

test('computes zero total pages for an empty result', async () => {
  resetState()
  state.total = 0

  const useCase = await createUseCase()
  const result = await useCase.execute({ page: 1, limit: 10 })

  expect(result.totalPages).toBe(0)
  expect(result.data).toEqual([])
})

test('throws an internal server error when the repository fails', async () => {
  resetState()
  state.fail = true

  const useCase = await createUseCase()
  await expect(useCase.execute({ page: 1, limit: 10 })).rejects.toMatchObject({
    name: 'InternalServerErrorException',
    message: 'admin.USERS_LIST_FAILED',
  })
})
