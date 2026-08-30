import { expect, test, vi } from 'vitest'
import { NotFoundException } from '@nestjs/common'

const state = vi.hoisted(() => ({ createCalls: 0, updateCalls: 0 }))

vi.mock('@repo/db', () => ({
  createTicket: async () => {
    state.createCalls += 1
    return null
  },
  findAvailableTicketTypeByDocumentId: async () => null,
  findEventOwnedByOwnerDocumentId: async () => ({ id: 1 }),
  findTicketWithRelationsOwnedByOwner: async () => ({ id: 1 }),
  updateTicketByDocumentId: async () => {
    state.updateCalls += 1
    return null
  },
}))

const translationService = { translateError: (code: string) => code } as never
import { CreateTicketUseCase } from './create-ticket.use-case.ts'
import { UpdateTicketUseCase } from './update-ticket.use-case.ts'

const input = {
  ticketTypeId: '8d1d285f-9d21-4b42-b218-495b05b4f223',
  price: 1000,
  quantity: 10,
  description: 'Private access',
  status: 'active' as const,
  eventId: 'event-id',
}

test('does not create a ticket with another owner ticket type', async () => {
  state.createCalls = 0

  await expect(
    new CreateTicketUseCase(translationService).execute('owner-id', input)
  ).rejects.toBeInstanceOf(NotFoundException)
  expect(state.createCalls).toBe(0)
})

test('does not update a ticket with another owner ticket type', async () => {
  state.updateCalls = 0

  await expect(
    new UpdateTicketUseCase(translationService).execute('owner-id', 'ticket-id', input)
  ).rejects.toBeInstanceOf(NotFoundException)
  expect(state.updateCalls).toBe(0)
})
