import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import {
  countPaymentsByTicketId,
  deleteTicketByDocumentId,
  findTicketWithRelationsOwnedByOwner,
} from '@repo/db'
import { TranslationService } from '@repo/i18n/server'

@Injectable()
export class DeleteTicketUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(ownerDocumentId: string, documentId: string): Promise<void> {
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
}
