import { expect, test, vi } from 'vitest'

const state = vi.hoisted(() => ({
  updated: true,
  fail: false,
  lastParams: null as Record<string, unknown> | null,
}))

vi.mock('@repo/db', () => ({
  updateProfileStatusByAccountDocumentId: async (accountDocumentId: string, status: string) => {
    state.lastParams = { accountDocumentId, status }
    if (state.fail) throw new Error('db down')
    return state.updated
  },
}))

import { UpdateAdminUserStatusUseCase } from './update-admin-user-status.use-case.ts'

function createUseCase() {
  return new UpdateAdminUserStatusUseCase({ translateError: (code: string) => code } as never)
}

function resetState() {
  state.updated = true
  state.fail = false
  state.lastParams = null
}

test('passes account document id and status through to the repository', async () => {
  resetState()

  const useCase = await createUseCase()
  await useCase.execute('acc-user', 'inactive')

  expect(state.lastParams).toEqual({ accountDocumentId: 'acc-user', status: 'inactive' })
})

test('throws a not found error when no profile was updated', async () => {
  resetState()
  state.updated = false

  const useCase = await createUseCase()
  await expect(useCase.execute('acc-admin', 'active')).rejects.toMatchObject({
    name: 'NotFoundException',
    message: 'admin.USERS_STATUS_UPDATE_NOT_FOUND',
  })
})

test('throws an internal server error when the repository fails', async () => {
  resetState()
  state.fail = true

  const useCase = await createUseCase()
  await expect(useCase.execute('acc-user', 'active')).rejects.toMatchObject({
    name: 'InternalServerErrorException',
    message: 'admin.USERS_STATUS_UPDATE_FAILED',
  })
})
