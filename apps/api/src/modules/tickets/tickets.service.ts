import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import {
  countPaymentsByTicketId,
  createTicket,
  deleteTicketByDocumentId,
  findEventOwnedByOwnerDocumentId,
  findTicketWithRelationsOwnedByOwner,
  findTicketsPaginatedByOwner,
  updateTicketByDocumentId,
} from '@afterdark/db'
import type { PaginatedResponse, TicketResponse } from '@afterdark/types'
import type {
  CreateTicketInput,
  ListTicketsQueryInput,
  UpdateTicketInput,
} from '@afterdark/validators'
import { TranslationService } from '@afterdark/i18n/server'
import { toTicketResponse, toTicketUpsertInput } from './utils/tickets.mapper'

@Injectable()
export class TicketsService {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async listMyTickets(
    ownerDocumentId: string,
    query: ListTicketsQueryInput
  ): Promise<PaginatedResponse<TicketResponse>> {
    try {
      const { rows, total } = await findTicketsPaginatedByOwner({
        ownerDocumentId,
        page: query.page,
        limit: query.limit,
        status: query.status,
        clubDocumentId: query.clubId,
      })

      const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit)

      return {
        data: rows.map(({ ticket, event, club }) => toTicketResponse(ticket, event, club)),
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      }
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('ticket.LIST_FAILED'))
    }
  }

  async createTicket(ownerDocumentId: string, input: CreateTicketInput): Promise<TicketResponse> {
    const eventId = await this.resolveEventId(ownerDocumentId, input.eventId)

    try {
      const row = await createTicket(toTicketUpsertInput(input, eventId))
      return toTicketResponse(row.ticket, row.event, row.club)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('ticket.CREATE_FAILED'))
    }
  }

  async updateTicket(
    ownerDocumentId: string,
    documentId: string,
    input: UpdateTicketInput
  ): Promise<TicketResponse> {
    const existing = await findTicketWithRelationsOwnedByOwner(documentId, ownerDocumentId)

    if (!existing) {
      throw new NotFoundException(this.ts.translateError('ticket.NOT_FOUND'))
    }

    const eventId = await this.resolveEventId(ownerDocumentId, input.eventId)

    try {
      const row = await updateTicketByDocumentId(documentId, toTicketUpsertInput(input, eventId))
      return toTicketResponse(row.ticket, row.event, row.club)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('ticket.UPDATE_FAILED'))
    }
  }

  async deleteTicket(ownerDocumentId: string, documentId: string): Promise<void> {
    const existing = await findTicketWithRelationsOwnedByOwner(documentId, ownerDocumentId)

    if (!existing) {
      throw new NotFoundException(this.ts.translateError('ticket.NOT_FOUND'))
    }

    const paymentCount = await countPaymentsByTicketId(existing.ticket.id)

    if (paymentCount > 0) {
      throw new ConflictException(this.ts.translateError('ticket.HAS_PAYMENTS'))
    }

    try {
      await deleteTicketByDocumentId(documentId)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('ticket.DELETE_FAILED'))
    }
  }

  private async resolveEventId(
    ownerDocumentId: string,
    eventDocumentId?: string
  ): Promise<number | null> {
    if (!eventDocumentId) {
      return null
    }

    const event = await findEventOwnedByOwnerDocumentId(eventDocumentId, ownerDocumentId)

    if (!event) {
      throw new NotFoundException(this.ts.translateError('ticket.EVENT_NOT_FOUND'))
    }

    return event.id
  }
}
