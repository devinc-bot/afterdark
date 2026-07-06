import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import {
  countTicketsByEventId,
  createEvent,
  deleteEventByDocumentId,
  findClubOwnedByOwnerDocumentId,
  findEventWithClubOwnedByOwnerDocumentId,
  findEventsPaginatedByOwner,
  updateEventByDocumentId,
} from '@afterdark/db'
import type { EventResponse, PaginatedResponse } from '@afterdark/types'
import type {
  CreateEventInput,
  ListEventsQueryInput,
  UpdateEventInput,
} from '@afterdark/validators'
import { TranslationService } from '@afterdark/i18n/server'
import { toEventResponse, toEventUpsertInput } from './utils/events.mapper'

@Injectable()
export class EventsService {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async listMyEvents(
    ownerDocumentId: string,
    query: ListEventsQueryInput
  ): Promise<PaginatedResponse<EventResponse>> {
    try {
      const { rows, total } = await findEventsPaginatedByOwner({
        ownerDocumentId,
        page: query.page,
        limit: query.limit,
      })

      const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit)

      return {
        data: rows.map(({ event, club }) => toEventResponse(event, club)),
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      }
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('event.LIST_FAILED'))
    }
  }

  async createEvent(ownerDocumentId: string, input: CreateEventInput): Promise<EventResponse> {
    const club = await findClubOwnedByOwnerDocumentId(input.clubId, ownerDocumentId)

    if (!club) {
      throw new NotFoundException(this.ts.translateError('event.CLUB_NOT_FOUND'))
    }

    try {
      const row = await createEvent(toEventUpsertInput(input, club.id))
      return toEventResponse(row.event, row.club)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('event.CREATE_FAILED'))
    }
  }

  async updateEvent(
    ownerDocumentId: string,
    documentId: string,
    input: UpdateEventInput
  ): Promise<EventResponse> {
    const existing = await findEventWithClubOwnedByOwnerDocumentId(documentId, ownerDocumentId)

    if (!existing) {
      throw new NotFoundException(this.ts.translateError('event.NOT_FOUND'))
    }

    const club = await findClubOwnedByOwnerDocumentId(input.clubId, ownerDocumentId)

    if (!club) {
      throw new NotFoundException(this.ts.translateError('event.CLUB_NOT_FOUND'))
    }

    try {
      const row = await updateEventByDocumentId(documentId, toEventUpsertInput(input, club.id))
      return toEventResponse(row.event, row.club)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('event.UPDATE_FAILED'))
    }
  }

  async deleteEvent(ownerDocumentId: string, documentId: string): Promise<void> {
    const existing = await findEventWithClubOwnedByOwnerDocumentId(documentId, ownerDocumentId)

    if (!existing) {
      throw new NotFoundException(this.ts.translateError('event.NOT_FOUND'))
    }

    const ticketCount = await countTicketsByEventId(existing.event.id)

    if (ticketCount > 0) {
      throw new ConflictException(this.ts.translateError('event.HAS_TICKETS'))
    }

    try {
      await deleteEventByDocumentId(documentId)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('event.DELETE_FAILED'))
    }
  }
}
