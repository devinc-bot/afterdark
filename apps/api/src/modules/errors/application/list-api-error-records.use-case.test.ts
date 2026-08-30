import { expect, test, vi } from 'vitest'

const state = vi.hoisted(() => ({
  rows: [] as Array<Record<string, unknown>>,
  total: 0,
  fail: false,
  lastParams: null as Record<string, unknown> | null,
}))

vi.mock('@repo/db', () => ({
  findApiErrorRecordsPaginated: async (params: Record<string, unknown>) => {
    state.lastParams = params
    if (state.fail) throw new Error('db down')
    return { rows: state.rows, total: state.total }
  },
}))

import { ListApiErrorRecordsUseCase } from './list-api-error-records.use-case.ts'

function createUseCase() {
  return new ListApiErrorRecordsUseCase({ translateError: (code: string) => code } as never)
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

  expect(result.total).toBe(25)
  expect(result.page).toBe(2)
  expect(result.limit).toBe(10)
  expect(result.totalPages).toBe(3)
  expect(result.data).toEqual([
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

  expect(state.lastParams).toEqual({
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

  expect(result.totalPages).toBe(0)
  expect(result.data).toEqual([])
})

test('throws an internal server error when the repository fails', async () => {
  resetState()
  state.fail = true

  const useCase = await createUseCase()
  await expect(useCase.execute({ page: 1, limit: 10 })).rejects.toMatchObject({
    name: 'InternalServerErrorException',
    message: 'admin.ERRORS_LIST_FAILED',
  })
})
