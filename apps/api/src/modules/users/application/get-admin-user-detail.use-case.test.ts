import { expect, test, vi } from 'vitest'

const state = vi.hoisted(() => ({
  row: null as Record<string, unknown> | null,
  fail: false,
  lastParams: null as Record<string, unknown> | null,
}))

vi.mock('@repo/db', () => ({
  findAdminUserDetailByAccountDocumentId: async (accountDocumentId: string) => {
    state.lastParams = { accountDocumentId }
    if (state.fail) throw new Error('db down')
    return state.row
  },
}))

import { GetAdminUserDetailUseCase } from './get-admin-user-detail.use-case.ts'

function createUseCase() {
  return new GetAdminUserDetailUseCase({ translateError: (code: string) => code } as never)
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

  expect(state.lastParams).toEqual({ accountDocumentId: 'acc-user' })
  expect(result).toEqual({
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
  await expect(useCase.execute('missing')).rejects.toMatchObject({
    name: 'NotFoundException',
    message: 'admin.USERS_DETAIL_NOT_FOUND',
  })
})

test('throws an internal server error when the repository fails', async () => {
  resetState()
  state.fail = true

  const useCase = await createUseCase()
  await expect(useCase.execute('acc-user')).rejects.toMatchObject({
    name: 'InternalServerErrorException',
    message: 'admin.USERS_DETAIL_FAILED',
  })
})
