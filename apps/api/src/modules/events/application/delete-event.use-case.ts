import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import {
  countTicketsByEventId,
  deleteEventByDocumentId,
  findEventWithLocationOwnedByOwnerDocumentId,
} from '@afterdark/db'
import { TranslationService } from '@afterdark/i18n/server'

@Injectable()
export class DeleteEventUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(ownerDocumentId: string, documentId: string): Promise<void> {
    const existing = await findEventWithLocationOwnedByOwnerDocumentId(documentId, ownerDocumentId)

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
