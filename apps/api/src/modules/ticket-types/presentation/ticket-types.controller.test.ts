import { expect, test } from 'vitest'
import { TicketTypesController } from './ticket-types.controller.ts'

test('delegates ticket-type listing and creation to owner use cases', async () => {
  const calls: string[] = []
  const listUseCase = {
    execute: async (ownerDocumentId: string) => [{ documentId: ownerDocumentId }],
  }
  const createUseCase = {
    execute: async (ownerDocumentId: string, input: { name: string }) => {
      calls.push(`${ownerDocumentId}:${input.name}`)
      return { documentId: 'type-id', name: input.name }
    },
  }
  const controller = new TicketTypesController(listUseCase as never, createUseCase as never)

  expect(await controller.list({ sub: 'owner-id' } as never)).toEqual([{ documentId: 'owner-id' }])
  expect(await controller.create({ sub: 'owner-id' } as never, { name: 'Backstage' })).toEqual({
    documentId: 'type-id',
    name: 'Backstage',
  })
  expect(calls).toEqual(['owner-id:Backstage'])
})
