import assert from 'node:assert/strict'
import { mock, test } from 'node:test'
import { ConflictException } from '@nestjs/common'

const state: {
  created: { documentId: string; id: number; name: string } | null
  duplicate: boolean
  ownerId: number | null
  visible: Array<{ documentId: string; id: number; name: string }>
} = {
  created: null,
  duplicate: false,
  ownerId: 1,
  visible: [],
}

mock.module('@repo/db', {
  namedExports: {
    createTicketType: async (input: { name: string; ownerId: number }) => {
      state.created = { id: input.ownerId, documentId: 'type-id', name: input.name }
      return state.created
    },
    findOwnerIdByDocumentId: async () => state.ownerId,
    findTicketTypeByNameForOwner: async () => (state.duplicate ? { id: 2 } : null),
    findTicketTypesByOwnerDocumentId: async () => state.visible,
  },
})

const translationService = { translateError: (code: string) => code } as never
const modulePromise = import('./create-ticket-type.use-case.ts')
const listModulePromise = import('./list-ticket-types.use-case.ts')

test('creates a custom ticket type for its owner', async () => {
  state.ownerId = 1
  state.duplicate = false
  const { CreateTicketTypeUseCase } = await modulePromise

  const result = await new CreateTicketTypeUseCase(translationService).execute('owner-id', {
    name: 'Backstage',
  })

  assert.deepEqual(result, { documentId: 'type-id', name: 'Backstage' })
  assert.deepEqual(state.created, { id: 1, documentId: 'type-id', name: 'Backstage' })
})

test('rejects a case-insensitive duplicate ticket type before insertion', async () => {
  state.duplicate = true
  const { CreateTicketTypeUseCase } = await modulePromise

  await assert.rejects(
    () =>
      new CreateTicketTypeUseCase(translationService).execute('owner-id', { name: 'backstage' }),
    ConflictException
  )
})

test('lists global and owner ticket types returned by the repository', async () => {
  state.visible = [
    { id: 1, documentId: 'general-id', name: 'General' },
    { id: 2, documentId: 'backstage-id', name: 'Backstage' },
  ]
  const { ListTicketTypesUseCase } = await listModulePromise

  const result = await new ListTicketTypesUseCase(translationService).execute('owner-id')

  assert.deepEqual(result, [
    { documentId: 'general-id', name: 'General' },
    { documentId: 'backstage-id', name: 'Backstage' },
  ])
})
