import { describe, expect, test, vi } from 'vitest'
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

const { state } = vi.hoisted(() => ({
  state: {
    createInput: null as unknown,
    organization: null as typeof organization | null,
    updateInput: null as unknown,
  },
}))

vi.mock('@repo/db', () => ({
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
}))

import { CreateEventUseCase } from './create-event.use-case.ts'
import { UpdateEventUseCase } from './update-event.use-case.ts'

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
  durationHours: 4 as const,
  status: EVENT_STATUS.DRAFT,
  faqs: [],
}

describe('event organization use cases', () => {
  test('creates an event for the owner sole organization', async () => {
    state.organization = organization
    state.createInput = null
    await new CreateEventUseCase(eventImages, translationService).execute('owner-one', input)

    expect((state.createInput as { organizationId: number }).organizationId).toBe(organization.id)
    expect((state.createInput as { locationId: number }).locationId).toBe(location.id)
    expect((state.createInput as { endsAt: Date }).endsAt.getTime()).toBe(
      event.startsAt.getTime() + 4 * 3_600_000
    )
  })

  test('updates an event without changing its authorized organization', async () => {
    state.organization = organization
    state.updateInput = null
    await new UpdateEventUseCase(eventImages, translationService).execute(
      'owner-one',
      event.documentId,
      input
    )

    expect((state.updateInput as { organizationId: number }).organizationId).toBe(organization.id)
    expect((state.updateInput as { endsAt: Date }).endsAt.getTime()).toBe(
      event.startsAt.getTime() + 4 * 3_600_000
    )
  })

  test('fails before persistence when owner organization context is invalid', async () => {
    state.organization = null
    state.createInput = null
    await expect(
      new CreateEventUseCase(eventImages, translationService).execute('owner-one', input)
    ).rejects.toMatchObject({
      name: 'InternalServerErrorException',
      message: 'event.CREATE_FAILED',
    })
    expect(state.createInput).toBeNull()
  })
})
