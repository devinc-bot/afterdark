import assert from 'node:assert/strict'
import { mock, test } from 'node:test'

const state: {
  rows: Array<{
    documentId: string
    method: string
    path: string
    statusCode: number
    errorName: string
    message: string
    stack: string | null
    correlationId: string | null
    fingerprint: string
    createdAt: Date
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
    findApiErrorRecordsPaginated: async (params: Record<string, unknown>) => {
      state.lastParams = params
      if (state.fail) throw new Error('db down')
      return { rows: state.rows, total: state.total }
    },
  },
})

const useCaseModulePromise = import('./list-api-error-records.use-case.ts')

function createUseCase() {
  return useCaseModulePromise.then(
    ({ ListApiErrorRecordsUseCase }) =>
      new ListApiErrorRecordsUseCase({ translateError: (code: string) => code } as never)
  )
}

function resetState() {
  state.rows = []
  state.total = 0
  state.fail = false
  state.lastParams = null
}

test('maps repository rows to API error record responses with pagination metadata', async () => {
  resetState()
  state.rows = [
    {
      documentId: 'rec-1',
      method: 'POST',
      path: '/api/events',
      statusCode: 503,
      errorName: 'UpstreamError',
      message: 'Service unavailable',
      stack: 'UpstreamError: Service unavailable',
      correlationId: 'request-123',
      fingerprint: 'a'.repeat(64),
      createdAt: new Date('2026-08-18T10:00:00.000Z'),
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
      documentId: 'rec-1',
      method: 'POST',
      path: '/api/events',
      statusCode: 503,
      errorName: 'UpstreamError',
      message: 'Service unavailable',
      stack: 'UpstreamError: Service unavailable',
      correlationId: 'request-123',
      fingerprint: 'a'.repeat(64),
      createdAt: '2026-08-18T10:00:00.000Z',
    },
  ])
})

test('passes filters through to the repository', async () => {
  resetState()
  state.total = 0

  const useCase = await createUseCase()
  await useCase.execute({
    page: 1,
    limit: 10,
    statusCode: 500,
    path: 'orders',
    from: new Date('2026-08-01T00:00:00.000Z'),
    to: new Date('2026-08-31T00:00:00.000Z'),
  })

  assert.deepEqual(state.lastParams, {
    page: 1,
    limit: 10,
    statusCode: 500,
    path: 'orders',
    from: new Date('2026-08-01T00:00:00.000Z'),
    to: new Date('2026-08-31T00:00:00.000Z'),
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
    message: 'admin.ERRORS_LIST_FAILED',
  })
})
