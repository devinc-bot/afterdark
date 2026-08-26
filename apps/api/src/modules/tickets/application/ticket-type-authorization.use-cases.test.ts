import assert from 'node:assert/strict'
import { mock, test } from 'node:test'
import { NotFoundException } from '@nestjs/common'

let createCalls = 0
let updateCalls = 0

mock.module('@repo/db', {
  namedExports: {
    createTicket: async () => {
      createCalls += 1
      return null
    },
    findAvailableTicketTypeByDocumentId: async () => null,
    findEventOwnedByOwnerDocumentId: async () => ({ id: 1 }),
    findTicketWithRelationsOwnedByOwner: async () => ({ id: 1 }),
    updateTicketByDocumentId: async () => {
      updateCalls += 1
      return null
    },
  },
})

const translationService = { translateError: (code: string) => code } as never
const createModulePromise = import('./create-ticket.use-case.ts')
const updateModulePromise = import('./update-ticket.use-case.ts')

const input = {
  ticketTypeId: '8d1d285f-9d21-4b42-b218-495b05b4f223',
  price: 1000,
  quantity: 10,
  description: 'Private access',
  status: 'active' as const,
  eventId: 'event-id',
}

test('does not create a ticket with another owner ticket type', async () => {
  createCalls = 0
  const { CreateTicketUseCase } = await createModulePromise

  await assert.rejects(
    () => new CreateTicketUseCase(translationService).execute('owner-id', input),
    NotFoundException
  )
  assert.equal(createCalls, 0)
})

test('does not update a ticket with another owner ticket type', async () => {
  updateCalls = 0
  const { UpdateTicketUseCase } = await updateModulePromise

  await assert.rejects(
    () => new UpdateTicketUseCase(translationService).execute('owner-id', 'ticket-id', input),
    NotFoundException
  )
  assert.equal(updateCalls, 0)
})
