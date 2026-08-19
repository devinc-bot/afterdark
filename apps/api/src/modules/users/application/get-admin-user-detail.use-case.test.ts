import assert from 'node:assert/strict'
import { mock, test } from 'node:test'

const state: {
  row: Record<string, unknown> | null
  fail: boolean
  lastParams: Record<string, unknown> | null
} = {
  row: null,
  fail: false,
  lastParams: null,
}

mock.module('@repo/db', {
  namedExports: {
    findAdminUserDetailByAccountDocumentId: async (accountDocumentId: string) => {
      state.lastParams = { accountDocumentId }
      if (state.fail) throw new Error('db down')
      return state.row
    },
  },
})

const useCaseModulePromise = import('./get-admin-user-detail.use-case.ts')

function createUseCase() {
  return useCaseModulePromise.then(
    ({ GetAdminUserDetailUseCase }) =>
      new GetAdminUserDetailUseCase({ translateError: (code: string) => code } as never)
  )
}

function resetState() {
  state.row = null
  state.fail = false
  state.lastParams = null
}

test('passes the account document id through and maps the detail row', async () => {
  resetState()
  state.row = {
    documentId: 'acc-user',
    email: 'user@example.com',
    provider: 'local',
    roleName: 'user',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    name: 'Alice',
    lastName: 'Smith',
    phone: '+15555550001',
    birthday: '1990-01-01',
    nationalId: '12345678',
    status: 'active',
    organizationName: null,
    taxId: null,
    address: null,
  }

  const useCase = await createUseCase()
  const result = await useCase.execute('acc-user')

  assert.deepEqual(state.lastParams, { accountDocumentId: 'acc-user' })
  assert.deepEqual(result, {
    documentId: 'acc-user',
    email: 'user@example.com',
    provider: 'local',
    role: 'user',
    createdAt: '2026-01-01T00:00:00.000Z',
    name: 'Alice',
    lastName: 'Smith',
    phone: '+15555550001',
    birthday: '1990-01-01',
    nationalId: '12345678',
    status: 'active',
    organizationName: null,
    taxId: null,
    address: null,
  })
})

test('throws a not found error when the account does not exist', async () => {
  resetState()
  state.row = null

  const useCase = await createUseCase()
  await assert.rejects(() => useCase.execute('missing'), {
    name: 'NotFoundException',
    message: 'admin.USERS_DETAIL_NOT_FOUND',
  })
})

test('throws an internal server error when the repository fails', async () => {
  resetState()
  state.fail = true

  const useCase = await createUseCase()
  await assert.rejects(() => useCase.execute('acc-user'), {
    name: 'InternalServerErrorException',
    message: 'admin.USERS_DETAIL_FAILED',
  })
})
