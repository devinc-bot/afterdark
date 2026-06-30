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
  findClubOwnedByOwnerDocumentId,
  findTicketWithClubOwnedByOwner,
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
        data: rows.map(({ ticket, club }) => toTicketResponse(ticket, club)),
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
    const club = await findClubOwnedByOwnerDocumentId(input.clubId, ownerDocumentId)

    if (!club) {
      throw new NotFoundException(this.ts.translateError('ticket.CLUB_NOT_FOUND'))
    }

    try {
      const row = await createTicket(club.id, toTicketUpsertInput(input))
      return toTicketResponse(row.ticket, row.club)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('ticket.CREATE_FAILED'))
    }
  }

  async updateTicket(
    ownerDocumentId: string,
    documentId: string,
    input: UpdateTicketInput
  ): Promise<TicketResponse> {
    const existing = await findTicketWithClubOwnedByOwner(documentId, ownerDocumentId)

    if (!existing) {
      throw new NotFoundException(this.ts.translateError('ticket.NOT_FOUND'))
    }

    try {
      const row = await updateTicketByDocumentId(documentId, toTicketUpsertInput(input))
      return toTicketResponse(row.ticket, row.club)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('ticket.UPDATE_FAILED'))
    }
  }

  async deleteTicket(ownerDocumentId: string, documentId: string): Promise<void> {
    const existing = await findTicketWithClubOwnedByOwner(documentId, ownerDocumentId)

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
}
