import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import {
  findEventOwnedByOwnerDocumentId,
  findAvailableTicketTypeByDocumentId,
  findTicketWithRelationsOwnedByOwner,
  updateTicketByDocumentId,
} from '@repo/db'
import { TranslationService } from '@repo/i18n/server'
import type { TicketResponse } from '@repo/types'
import type { UpdateTicketInput } from '@repo/validators'
import { toTicketResponse, toTicketUpsertInput } from '../mappers/tickets.mapper'

@Injectable()
export class UpdateTicketUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(
    ownerDocumentId: string,
    documentId: string,
    input: UpdateTicketInput
  ): Promise<TicketResponse> {
    const existing = await findTicketWithRelationsOwnedByOwner(documentId, ownerDocumentId)

    if (!existing) {
      throw new NotFoundException(this.ts.translateError('ticket.NOT_FOUND'))
    }

    const eventId = await this.resolveEventId(ownerDocumentId, input.eventId)
    const ticketType = await findAvailableTicketTypeByDocumentId(
      input.ticketTypeId,
      ownerDocumentId
    )

    if (!ticketType) {
      throw new NotFoundException(this.ts.translateError('ticketType.NOT_FOUND'))
    }

    try {
      const row = await updateTicketByDocumentId(
        documentId,
        toTicketUpsertInput(input, eventId, ticketType.id)
      )
      return toTicketResponse(row.ticket, row.ticketType, row.event, row.location)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('ticket.UPDATE_FAILED'))
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
