import assert from 'node:assert/strict'
import { mock, test } from 'node:test'

const state: {
  rows: Array<{
    documentId: string
    email: string
    createdAt: Date
    roleName: string
    userName: string | null
    userLastName: string | null
    ownerName: string | null
    ownerLastName: string | null
    staffName: string | null
    staffLastName: string | null
    userStatus: string | null
    ownerStatus: string | null
    staffStatus: string | null
  }>
  total: number
  fail: boolean
  lastParams: Record<string, unknown> | null
} = {
  rows: [],
  total: 0,
  fail: false,
  lastParams: null,
}

mock.module('@repo/db', {
  namedExports: {
    findAccountsWithRolePaginated: async (params: Record<string, unknown>) => {
      state.lastParams = params
      if (state.fail) throw new Error('db down')
      return { rows: state.rows, total: state.total }
    },
  },
})

const useCaseModulePromise = import('./list-admin-users.use-case.ts')

function createUseCase() {
  return useCaseModulePromise.then(
    ({ ListAdminUsersUseCase }) =>
      new ListAdminUsersUseCase({ translateError: (code: string) => code } as never)
  )
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

  assert.equal(result.total, 25)
  assert.equal(result.page, 2)
  assert.equal(result.limit, 10)
  assert.equal(result.totalPages, 3)
  assert.deepEqual(result.data, [
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

  assert.deepEqual(result.data[0], {
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

  assert.deepEqual(state.lastParams, {
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

  assert.equal(result.totalPages, 0)
  assert.deepEqual(result.data, [])
})

test('throws an internal server error when the repository fails', async () => {
  resetState()
  state.fail = true

  const useCase = await createUseCase()
  await assert.rejects(() => useCase.execute({ page: 1, limit: 10 }), {
    name: 'InternalServerErrorException',
    message: 'admin.USERS_LIST_FAILED',
  })
})
