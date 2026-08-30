import { expect, test, vi } from 'vitest'
import { DeleteApiErrorRecordUseCase } from './delete-api-error-record.use-case.ts'

const state = vi.hoisted(() => ({ deleted: true, fail: false }))

vi.mock('@repo/db', () => ({
  deleteApiErrorRecordByDocumentId: async () => {
    if (state.fail) throw new Error('db down')
    return state.deleted
  },
}))

function createUseCase() {
  return new DeleteApiErrorRecordUseCase({ translateError: (code: string) => code } as never)
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
  await expect(useCase.execute('missing')).rejects.toMatchObject({
    name: 'NotFoundException',
    message: 'admin.ERRORS_DELETE_NOT_FOUND',
  })
})

test('throws an internal server error when the repository fails', async () => {
  state.deleted = false
  state.fail = true

  const useCase = await createUseCase()
  await expect(useCase.execute('rec-1')).rejects.toMatchObject({
    name: 'InternalServerErrorException',
    message: 'admin.ERRORS_DELETE_FAILED',
  })
})
