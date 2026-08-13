import assert from 'node:assert/strict'
import { mock, test } from 'node:test'
import { PAYMENT_STATUS, type PaymentStatus } from '@repo/types'

type Order = {
  status: PaymentStatus | null
  externalOrderId: string | null
}

const state: {
  currentOrder: Order | null
  deleteResult: boolean
  initialOrder: Order | null
  userId: number | null
} = {
  currentOrder: null,
  deleteResult: false,
  initialOrder: null,
  userId: null,
}
let findOrderCallCount = 0

mock.module('@repo/db', {
  namedExports: {
    findUserIdByDocumentId: async () => state.userId,
    findOrderByDocumentIdAndUserId: async () => {
      findOrderCallCount += 1
      return findOrderCallCount === 1 ? state.initialOrder : state.currentOrder
    },
    deletePendingOrderByDocumentIdAndUserId: async () => state.deleteResult,
  },
})

const useCaseModulePromise = import('./delete-pending-order.use-case.ts')

function resetState({
  currentOrder,
  deleteResult,
  initialOrder,
  userId = 1,
}: {
  currentOrder?: Order | null
  deleteResult: boolean
  initialOrder: Order | null
  userId?: number | null
}) {
  state.currentOrder = currentOrder ?? initialOrder
  state.deleteResult = deleteResult
  state.initialOrder = initialOrder
  state.userId = userId
  findOrderCallCount = 0
}

function createUseCase({
  expirePreference,
}: {
  expirePreference: (preferenceId: string) => Promise<void>
}) {
  return useCaseModulePromise.then(
    ({ DeletePendingOrderUseCase }) =>
      new DeletePendingOrderUseCase(
        { translateError: (code: string) => code } as never,
        { expirePreference } as never
      )
  )
}

test('expires the provider preference before deleting an owned pending order', async () => {
  resetState({
    initialOrder: { status: PAYMENT_STATUS.PENDING, externalOrderId: 'preference-1' },
    deleteResult: true,
  })
  const expiredPreferences: string[] = []
  const useCase = await createUseCase({
    expirePreference: async (preferenceId) => {
      expiredPreferences.push(preferenceId)
    },
  })

  await useCase.execute('buyer-1', 'order-1')

  assert.deepEqual(expiredPreferences, ['preference-1'])
})

test('rejects deletion of an owned non-pending order', async () => {
  resetState({
    initialOrder: { status: PAYMENT_STATUS.COMPLETED, externalOrderId: 'preference-1' },
    deleteResult: false,
  })
  const useCase = await createUseCase({ expirePreference: async () => undefined })

  await assert.rejects(() => useCase.execute('buyer-1', 'order-1'), {
    name: 'ConflictException',
    message: 'order.DELETE_NOT_PENDING',
  })
})

test('retains the local order when preference expiration fails', async () => {
  resetState({
    initialOrder: { status: PAYMENT_STATUS.PENDING, externalOrderId: 'preference-1' },
    deleteResult: true,
  })
  const useCase = await createUseCase({
    expirePreference: async () => {
      throw new Error('Mercado Pago unavailable')
    },
  })

  await assert.rejects(() => useCase.execute('buyer-1', 'order-1'), {
    name: 'InternalServerErrorException',
    message: 'order.DELETE_FAILED',
  })
})

test('returns not found when the buyer does not own an order', async () => {
  resetState({ initialOrder: null, deleteResult: false })
  const useCase = await createUseCase({ expirePreference: async () => undefined })

  await assert.rejects(() => useCase.execute('buyer-1', 'order-1'), {
    name: 'NotFoundException',
    message: 'order.NOT_FOUND',
  })
})

test('rejects deletion when reconciliation completes the order concurrently', async () => {
  resetState({
    initialOrder: { status: PAYMENT_STATUS.PENDING, externalOrderId: null },
    currentOrder: { status: PAYMENT_STATUS.COMPLETED, externalOrderId: null },
    deleteResult: false,
  })
  const useCase = await createUseCase({ expirePreference: async () => undefined })

  await assert.rejects(() => useCase.execute('buyer-1', 'order-1'), {
    name: 'ConflictException',
    message: 'order.DELETE_NOT_PENDING',
  })
})
