import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  findCurrentOwnerByDocumentId,
  findOwnerIdByDocumentId,
  updateOwnerByDocumentId,
  upsertOwnerAddress,
} from '@afterdark/db'
import type { CurrentOwnerResponse } from '@afterdark/types'
import type { UpdateCurrentOwnerInput } from '@afterdark/validators'
import { TranslationService } from '@afterdark/i18n/server'
import { GetCurrentOwnerUseCase } from './get-current-owner.use-case'

@Injectable()
export class UpdateCurrentOwnerUseCase {
  constructor(
    @Inject(GetCurrentOwnerUseCase) private readonly getCurrentOwner: GetCurrentOwnerUseCase,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(documentId: string, input: UpdateCurrentOwnerInput): Promise<CurrentOwnerResponse> {
    const current = await findCurrentOwnerByDocumentId(documentId)

    if (!current) {
      throw new NotFoundException(this.ts.translateError('owner.NOT_FOUND'))
    }

    const hasAddressInput = Object.values(input.address).some((value) => value.length > 0)

    if (!hasAddressInput && current.address) {
      throw new BadRequestException(this.ts.translateNs('validation', 'field.address.cannotClear'))
    }

    await updateOwnerByDocumentId(documentId, {
      name: input.name,
      lastName: input.lastName,
      phone: input.phone,
      birthday: input.birthday || null,
      nationalId: input.nationalId || null,
      taxId: input.taxId || null,
    })

    if (hasAddressInput) {
      const ownerId = await findOwnerIdByDocumentId(documentId)

      if (!ownerId) {
        throw new NotFoundException(this.ts.translateError('owner.NOT_FOUND'))
      }

      await upsertOwnerAddress(ownerId, input.address)
    }

    return this.getCurrentOwner.execute(documentId)
  }
}
