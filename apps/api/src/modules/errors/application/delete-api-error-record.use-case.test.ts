import assert from 'node:assert/strict'
import { mock, test } from 'node:test'

const state: { deleted: boolean; fail: boolean } = { deleted: true, fail: false }

mock.module('@repo/db', {
  namedExports: {
    deleteApiErrorRecordByDocumentId: async () => {
      if (state.fail) throw new Error('db down')
      return state.deleted
    },
  },
})

const useCaseModulePromise = import('./delete-api-error-record.use-case.ts')

function createUseCase() {
  return useCaseModulePromise.then(
    ({ DeleteApiErrorRecordUseCase }) =>
      new DeleteApiErrorRecordUseCase({ translateError: (code: string) => code } as never)
  )
}

test('resolves when the record is deleted', async () => {
  state.deleted = true
  state.fail = false

  const useCase = await createUseCase()
  await useCase.execute('rec-1')
})

test('throws not found when no record matches', async () => {
  state.deleted = false
  state.fail = false

  const useCase = await createUseCase()
  await assert.rejects(() => useCase.execute('missing'), {
    name: 'NotFoundException',
    message: 'admin.ERRORS_DELETE_NOT_FOUND',
  })
})

test('throws an internal server error when the repository fails', async () => {
  state.deleted = false
  state.fail = true

  const useCase = await createUseCase()
  await assert.rejects(() => useCase.execute('rec-1'), {
    name: 'InternalServerErrorException',
    message: 'admin.ERRORS_DELETE_FAILED',
  })
})
