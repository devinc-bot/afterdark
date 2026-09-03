import { expect, test, vi } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { USER_ROLE } from '@repo/types'

const state = vi.hoisted(() => ({
  organization: { id: 10 } as { id: number } | null,
  rows: [] as unknown[],
  total: 0,
  lastQuery: null as unknown,
}))

vi.mock('@repo/db', () => ({
  findEventOrganizationByOperator: async (params: unknown) => {
    state.lastQuery = params
    return state.organization
  },
  findScannedTicketsPaginatedByEvent: async (params: unknown) => {
    state.lastQuery = params
    return { rows: state.rows, total: state.total }
  },
}))

import { ListScannedTicketsHistoryUseCase } from './list-scanned-tickets-history.use-case.ts'
const translationService = { translateError: (code: string) => code } as never

test('returns a paginated history for an authorized operator', async () => {
  state.organization = { id: 10 }
  state.rows = [
    {
      scannedAt: new Date('2026-08-17T22:00:00.000Z'),
      ticket: { ticketType: { documentId: 'type-general', name: 'General' } },
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

  const result = await new ListScannedTicketsHistoryUseCase(translationService).execute(
    'owner-one',
    USER_ROLE.OWNER,
    { eventId: 'event-one', page: 2, limit: 10 }
  )

  expect(result.total).toBe(25)
  expect(result.page).toBe(2)
  expect(result.totalPages).toBe(3)
  expect(result.data).toHaveLength(1)
  expect(result.data[0]?.purchaser.fullName).toBe('Ada Lovelace')
  expect(result.data[0]?.purchaser.phone).toBeNull()
})

test('throws not found when the operator is not a member of the event organization', async () => {
  state.organization = null
  await expect(
    new ListScannedTicketsHistoryUseCase(translationService).execute('owner-two', USER_ROLE.OWNER, {
      eventId: 'event-one',
      page: 1,
      limit: 10,
    })
  ).rejects.toBeInstanceOf(NotFoundException)
})
