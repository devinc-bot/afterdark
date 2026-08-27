import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { findTicketTypesByOwnerDocumentId } from '@repo/db'
import { TranslationService } from '@repo/i18n/server'
import type { TicketTypeResponse } from '@repo/types'
import { toTicketTypeResponse } from '../mappers/ticket-types.mapper'

@Injectable()
export class ListTicketTypesUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(ownerDocumentId: string): Promise<TicketTypeResponse[]> {
    try {
      return (await findTicketTypesByOwnerDocumentId(ownerDocumentId)).map(toTicketTypeResponse)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('ticketType.LIST_FAILED'))
    }
  }
}
