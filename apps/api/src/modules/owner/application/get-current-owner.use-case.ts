import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { findCurrentOwnerByDocumentId } from '@afterdark/db'
import { USER_ROLE, type CurrentOwnerResponse } from '@afterdark/types'
import { TranslationService } from '@afterdark/i18n/server'

@Injectable()
export class GetCurrentOwnerUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(documentId: string): Promise<CurrentOwnerResponse> {
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
}
