import assert from 'node:assert/strict'
import { mock, test } from 'node:test'
import { NotFoundException } from '@nestjs/common'
import { USER_ROLE } from '@repo/types'

const state: {
  organization: { id: number } | null
  rows: unknown[]
  total: number
  lastQuery: unknown
} = {
  organization: { id: 10 },
  rows: [],
  total: 0,
  lastQuery: null,
}

mock.module('@repo/db', {
  namedExports: {
    findEventOrganizationByOperator: async (params: unknown) => {
      state.lastQuery = params
      return state.organization
    },
    findScannedTicketsPaginatedByEvent: async (params: unknown) => {
      state.lastQuery = params
      return { rows: state.rows, total: state.total }
    },
  },
})

const useCaseModulePromise = import('./list-scanned-tickets-history.use-case.ts')
const translationService = { translateError: (code: string) => code } as never

test('returns a paginated history for an authorized operator', async () => {
  state.organization = { id: 10 }
  state.rows = [
    {
      scannedAt: new Date('2026-08-17T22:00:00.000Z'),
      ticket: { name: 'General', type: 'general' },
      purchaser: { name: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', phone: '' },
      operator: {
        accountId: 1,
        fullName: 'Grace Hopper',
        email: 'grace@example.com',
        role: 'owner',
      },
    },
  ]
  state.total = 25

  const { ListScannedTicketsHistoryUseCase } = await useCaseModulePromise
  const result = await new ListScannedTicketsHistoryUseCase(translationService).execute(
    'owner-one',
    USER_ROLE.OWNER,
    { eventId: 'event-one', page: 2, limit: 10 }
  )

  assert.equal(result.total, 25)
  assert.equal(result.page, 2)
  assert.equal(result.totalPages, 3)
  assert.equal(result.data.length, 1)
  assert.equal(result.data[0]?.purchaser.fullName, 'Ada Lovelace')
  assert.equal(result.data[0]?.purchaser.phone, null)
})

test('throws not found when the operator is not a member of the event organization', async () => {
  state.organization = null
  const { ListScannedTicketsHistoryUseCase } = await useCaseModulePromise

  await assert.rejects(
    () =>
      new ListScannedTicketsHistoryUseCase(translationService).execute(
        'owner-two',
        USER_ROLE.OWNER,
        { eventId: 'event-one', page: 1, limit: 10 }
      ),
    (error: unknown) => {
      assert.ok(error instanceof NotFoundException)
      return true
    }
  )
})
