import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { createTicket, findEventOwnedByOwnerDocumentId } from '@afterdark/db'
import { TranslationService } from '@afterdark/i18n/server'
import type { TicketResponse } from '@afterdark/types'
import type { CreateTicketInput } from '@afterdark/validators'
import { toTicketResponse, toTicketUpsertInput } from '../mappers/tickets.mapper'

@Injectable()
export class CreateTicketUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(ownerDocumentId: string, input: CreateTicketInput): Promise<TicketResponse> {
    const eventId = await this.resolveEventId(ownerDocumentId, input.eventId)

    try {
      const row = await createTicket(toTicketUpsertInput(input, eventId))
      return toTicketResponse(row.ticket, row.event, row.club)
    } catch (error) {
      console.error('[CreateTicketUseCase] create failed', {
        ownerDocumentId,
        input,
        eventId,
        error,
      })
      throw new InternalServerErrorException(this.ts.translateError('ticket.CREATE_FAILED'))
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
