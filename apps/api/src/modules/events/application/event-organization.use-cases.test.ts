import assert from 'node:assert/strict'
import { mock, test } from 'node:test'
import { EVENT_STATUS } from '@repo/types'

const organization = {
  id: 10,
  documentId: 'organization-one',
  name: 'Organization One',
  taxId: null,
}
const location = {
  id: 20,
  documentId: 'location-one',
  createdAt: new Date(1000),
  updatedAt: new Date(1000),
  name: 'Location One',
  capacity: '100',
  description: null,
  ownerId: 1,
}
const event = {
  id: 30,
  documentId: 'event-one',
  createdAt: new Date(1000),
  updatedAt: new Date(1000),
  locationId: location.id,
  organizationId: organization.id,
  name: 'Event One',
  description: 'Description',
  startsAt: new Date(2000),
  endsAt: new Date(3000),
  location: null,
  status: EVENT_STATUS.DRAFT,
}

const state: {
  createInput: unknown
  organization: typeof organization | null
  updateInput: unknown
} = {
  createInput: null,
  organization,
  updateInput: null,
}

mock.module('@repo/db', {
  namedExports: {
    createEvent: async (input: unknown) => {
      state.createInput = input
      return { event, location, faqs: [] }
    },
    findEventImageAssetsByEventIds: async () => [],
    findEventWithLocationOwnedByOwnerDocumentId: async () => ({ event, location, faqs: [] }),
    findLocationOwnedByOwnerDocumentId: async () => location,
    findSoleOrganizationByOwnerDocumentId: async () => state.organization,
    updateEventByDocumentId: async (_documentId: string, input: unknown) => {
      state.updateInput = input
      return { event, location, faqs: [] }
    },
  },
})

const createUseCaseModulePromise = import('./create-event.use-case.ts')
const updateUseCaseModulePromise = import('./update-event.use-case.ts')

const translationService = {
  translateError: (code: string) => code,
} as never
const eventImages = {
  getByEventId: async () => [],
  removeUnwanted: async () => undefined,
  rollback: async () => undefined,
  saveNew: async () => [],
  upload: async () => [],
} as never
const input = {
  locationId: location.documentId,
  name: event.name,
  description: event.description,
  startsAt: event.startsAt,
  endsAt: event.endsAt,
  status: EVENT_STATUS.DRAFT,
  faqs: [],
}

test('creates an event for the owner sole organization', async () => {
  state.organization = organization
  state.createInput = null
  const { CreateEventUseCase } = await createUseCaseModulePromise

  await new CreateEventUseCase(eventImages, translationService).execute('owner-one', input)

  assert.equal((state.createInput as { organizationId: number }).organizationId, organization.id)
  assert.equal((state.createInput as { locationId: number }).locationId, location.id)
})

test('updates an event without changing its authorized organization', async () => {
  state.organization = organization
  state.updateInput = null
  const { UpdateEventUseCase } = await updateUseCaseModulePromise

  await new UpdateEventUseCase(eventImages, translationService).execute(
    'owner-one',
    event.documentId,
    input
  )

  assert.equal((state.updateInput as { organizationId: number }).organizationId, organization.id)
})

test('fails before persistence when owner organization context is invalid', async () => {
  state.organization = null
  state.createInput = null
  const { CreateEventUseCase } = await createUseCaseModulePromise

  await assert.rejects(
    () => new CreateEventUseCase(eventImages, translationService).execute('owner-one', input),
    { name: 'InternalServerErrorException', message: 'event.CREATE_FAILED' }
  )
  assert.equal(state.createInput, null)
})
