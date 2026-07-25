import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { findTicketWithRelationsOwnedByOwner } from '@repo/db'
import { TranslationService } from '@repo/i18n/server'
import type { TicketResponse } from '@repo/types'
import { toTicketResponse } from '../mappers/tickets.mapper'

@Injectable()
export class GetTicketByDocumentIdUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(ownerDocumentId: string, documentId: string): Promise<TicketResponse> {
    const row = await findTicketWithRelationsOwnedByOwner(documentId, ownerDocumentId)

    if (!row) {
      throw new NotFoundException(this.ts.translateError('ticket.NOT_FOUND'))
    }

    return toTicketResponse(row.ticket, row.event, row.location)
  }
}
