import { Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { accounts, db, ownerAccountsLnk, owners } from '@afterdark/db'
import type { CurrentOwnerResponse } from '@afterdark/types'
import type { UpdateCurrentOwnerInput } from '@afterdark/validators'
import { OWNER_MESSAGE } from './owner.constants'

@Injectable()
export class OwnerService {
  async getCurrentOwner(documentId: string): Promise<CurrentOwnerResponse> {
    const [row] = await db
      .select({
        documentId: owners.documentId,
        name: owners.name,
        lastName: owners.lastName,
        avatar: owners.avatar,
        phone: owners.phone,
        birthday: owners.birthday,
        nationalId: owners.nationalId,
        taxId: owners.taxId,
        status: owners.status,
        email: accounts.email,
      })
      .from(owners)
      .innerJoin(ownerAccountsLnk, eq(ownerAccountsLnk.ownerId, owners.id))
      .innerJoin(accounts, eq(accounts.id, ownerAccountsLnk.accountId))
      .where(eq(owners.documentId, documentId))
      .limit(1)

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
    const [existing] = await db
      .select({ id: owners.id })
      .from(owners)
      .where(eq(owners.documentId, documentId))
      .limit(1)

    if (!existing) {
      throw new NotFoundException(OWNER_MESSAGE.NOT_FOUND)
    }

    await db
      .update(owners)
      .set({
        name: input.name,
        lastName: input.lastName,
        phone: input.phone,
        birthday: input.birthday || null,
        nationalId: input.nationalId || null,
        taxId: input.taxId || null,
        updatedAt: new Date(),
      })
      .where(eq(owners.documentId, documentId))

    return this.getCurrentOwner(documentId)
  }
}
