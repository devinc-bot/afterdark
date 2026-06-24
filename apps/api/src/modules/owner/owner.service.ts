import { Injectable, NotFoundException } from '@nestjs/common'
import {
  findCurrentOwnerByDocumentId,
  findOwnerIdByDocumentId,
  updateOwnerByDocumentId,
} from '@afterdark/db'
import type { CurrentOwnerResponse } from '@afterdark/types'
import type { UpdateCurrentOwnerInput } from '@afterdark/validators'
import { OWNER_MESSAGE } from './owner.constants'

@Injectable()
export class OwnerService {
  async getCurrentOwner(documentId: string): Promise<CurrentOwnerResponse> {
    const row = await findCurrentOwnerByDocumentId(documentId)

    if (!row) {
      throw new NotFoundException(OWNER_MESSAGE.NOT_FOUND)
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
    }
  }

  async updateCurrentOwner(
    documentId: string,
    input: UpdateCurrentOwnerInput
  ): Promise<CurrentOwnerResponse> {
    const ownerId = await findOwnerIdByDocumentId(documentId)

    if (!ownerId) {
      throw new NotFoundException(OWNER_MESSAGE.NOT_FOUND)
    }

    await updateOwnerByDocumentId(documentId, {
      name: input.name,
      lastName: input.lastName,
      phone: input.phone,
      birthday: input.birthday || null,
      nationalId: input.nationalId || null,
      taxId: input.taxId || null,
    })

    return this.getCurrentOwner(documentId)
  }
}
