import { ConflictException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { createTicketType, findOwnerIdByDocumentId, findTicketTypeByNameForOwner } from '@repo/db'
import { TranslationService } from '@repo/i18n/server'
import type { TicketTypeResponse } from '@repo/types'
import type { CreateTicketTypeInput } from '@repo/validators'
import { toTicketTypeResponse } from '../mappers/ticket-types.mapper'

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505'
}

@Injectable()
export class CreateTicketTypeUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(
    ownerDocumentId: string,
    input: CreateTicketTypeInput
  ): Promise<TicketTypeResponse> {
    const ownerId = await findOwnerIdByDocumentId(ownerDocumentId)
    if (!ownerId) {
      throw new InternalServerErrorException(this.ts.translateError('ticketType.CREATE_FAILED'))
    }

    if (await findTicketTypeByNameForOwner(input.name, ownerId)) {
      throw new ConflictException(this.ts.translateError('ticketType.DUPLICATE'))
    }

    try {
      return toTicketTypeResponse(await createTicketType({ name: input.name, ownerId }))
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(this.ts.translateError('ticketType.DUPLICATE'))
      }
      throw new InternalServerErrorException(this.ts.translateError('ticketType.CREATE_FAILED'))
    }
  }
}
