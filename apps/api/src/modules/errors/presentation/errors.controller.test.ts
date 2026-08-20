import assert from 'node:assert/strict'
import test from 'node:test'
import { ErrorsController } from './errors.controller.ts'

test('delegates error record listing to the use case', async () => {
  const calls: Array<{ query: { page: number; limit: number } }> = []
  const result = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
  const listApiErrorRecordsUseCase = {
    execute: async (query: { page: number; limit: number }) => {
      calls.push({ query })
      return result
    },
  }
  const controller = new ErrorsController(listApiErrorRecordsUseCase as never, undefined as never)

  assert.equal(await controller.list({ page: 1, limit: 10 }), result)
  assert.deepEqual(calls, [{ query: { page: 1, limit: 10 } }])
})

test('delegates error record deletion to the use case', async () => {
  const calls: string[] = []
  const deleteApiErrorRecordUseCase = {
    execute: async (documentId: string) => {
      calls.push(documentId)
    },
  }
  const controller = new ErrorsController(undefined as never, deleteApiErrorRecordUseCase as never)

  await controller.delete('rec-1')

  assert.deepEqual(calls, ['rec-1'])
})
