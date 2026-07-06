import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  findCurrentOwnerByDocumentId,
  findOwnerIdByDocumentId,
  updateOwnerByDocumentId,
  upsertOwnerAddress,
} from '@afterdark/db'
import { USER_ROLE, type CurrentOwnerResponse } from '@afterdark/types'
import type { UpdateCurrentOwnerInput } from '@afterdark/validators'
import { TranslationService } from '@afterdark/i18n/server'

@Injectable()
export class OwnerService {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async getCurrentOwner(documentId: string): Promise<CurrentOwnerResponse> {
    const row = await findCurrentOwnerByDocumentId(documentId)

    if (!row) {
      throw new NotFoundException(this.ts.translateError('owner.NOT_FOUND'))
    }

    return {
      sub: row.documentId,
      name: row.name,
      lastName: row.lastName,
      email: row.email,
      avatar: row.avatar,
      phone: row.phone,
      birthday: row.birthday,
      nationalId: row.nationalId,
      taxId: row.taxId,
      status: row.status,
      role: USER_ROLE.OWNER,
      address: row.address,
    }
  }

  async updateCurrentOwner(
    documentId: string,
    input: UpdateCurrentOwnerInput
  ): Promise<CurrentOwnerResponse> {
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

    return this.getCurrentOwner(documentId)
  }
}
