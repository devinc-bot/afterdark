import { expect, test, vi } from 'vitest'
import { ConflictException } from '@nestjs/common'

const state = vi.hoisted(() => ({
  created: null as { documentId: string; id: number; name: string } | null,
  duplicate: false,
  ownerId: 1 as number | null,
  visible: [] as Array<{ documentId: string; id: number; name: string }>,
}))

vi.mock('@repo/db', () => ({
  createTicketType: async (input: { name: string; ownerId: number }) => {
    state.created = { id: input.ownerId, documentId: 'type-id', name: input.name }
    return state.created
  },
  findOwnerIdByDocumentId: async () => state.ownerId,
  findTicketTypeByNameForOwner: async () => (state.duplicate ? { id: 2 } : null),
  findTicketTypesByOwnerDocumentId: async () => state.visible,
}))

const translationService = { translateError: (code: string) => code } as never
import { CreateTicketTypeUseCase } from './create-ticket-type.use-case.ts'
import { ListTicketTypesUseCase } from './list-ticket-types.use-case.ts'

test('creates a custom ticket type for its owner', async () => {
  state.ownerId = 1
  state.duplicate = false

  const result = await new CreateTicketTypeUseCase(translationService).execute('owner-id', {
    name: 'Backstage',
  })

  expect(result).toEqual({ documentId: 'type-id', name: 'Backstage' })
  expect(state.created).toEqual({ id: 1, documentId: 'type-id', name: 'Backstage' })
})

test('rejects a case-insensitive duplicate ticket type before insertion', async () => {
  state.duplicate = true
  await expect(
    new CreateTicketTypeUseCase(translationService).execute('owner-id', { name: 'backstage' })
  ).rejects.toBeInstanceOf(ConflictException)
})

test('lists global and owner ticket types returned by the repository', async () => {
  state.visible = [
    { id: 1, documentId: 'general-id', name: 'General' },
    { id: 2, documentId: 'backstage-id', name: 'Backstage' },
  ]
  const result = await new ListTicketTypesUseCase(translationService).execute('owner-id')

  expect(result).toEqual([
    { documentId: 'general-id', name: 'General' },
    { documentId: 'backstage-id', name: 'Backstage' },
  ])
})
