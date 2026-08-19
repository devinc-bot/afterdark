import assert from 'node:assert/strict'
import { mock, test } from 'node:test'

const state: {
  updated: boolean
  fail: boolean
  lastParams: Record<string, unknown> | null
} = {
  updated: true,
  fail: false,
  lastParams: null,
}

mock.module('@repo/db', {
  namedExports: {
    updateProfileStatusByAccountDocumentId: async (accountDocumentId: string, status: string) => {
      state.lastParams = { accountDocumentId, status }
      if (state.fail) throw new Error('db down')
      return state.updated
    },
  },
})

const useCaseModulePromise = import('./update-admin-user-status.use-case.ts')

function createUseCase() {
  return useCaseModulePromise.then(
    ({ UpdateAdminUserStatusUseCase }) =>
      new UpdateAdminUserStatusUseCase({ translateError: (code: string) => code } as never)
  )
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

  assert.deepEqual(state.lastParams, { accountDocumentId: 'acc-user', status: 'inactive' })
})

test('throws a not found error when no profile was updated', async () => {
  resetState()
  state.updated = false

  const useCase = await createUseCase()
  await assert.rejects(() => useCase.execute('acc-admin', 'active'), {
    name: 'NotFoundException',
    message: 'admin.USERS_STATUS_UPDATE_NOT_FOUND',
  })
})

test('throws an internal server error when the repository fails', async () => {
  resetState()
  state.fail = true

  const useCase = await createUseCase()
  await assert.rejects(() => useCase.execute('acc-user', 'active'), {
    name: 'InternalServerErrorException',
    message: 'admin.USERS_STATUS_UPDATE_FAILED',
  })
})
