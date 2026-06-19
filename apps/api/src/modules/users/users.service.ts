import { Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { accounts, addresses, db, userAccountsLnk, userAddressesLnk, users } from '@afterdark/db'
import type { CurrentUserAddress, CurrentUserResponse } from '@afterdark/types'
import type { UpdateCurrentUserInput } from '@afterdark/validators'
import { USER_MESSAGE } from './users.constants'

type AddressRow = {
  addressLine: string | null
  streetNumber: string | null
  state: string | null
  city: string | null
}

function toCurrentUserAddress(row: AddressRow): CurrentUserAddress | null {
  const { addressLine, streetNumber, state, city } = row

  if (addressLine === null || streetNumber === null || state === null || city === null) {
    return null
  }

  return { address: addressLine, streetNumber, state, city }
}

@Injectable()
export class UsersService {
  async getCurrentUser(documentId: string): Promise<CurrentUserResponse> {
    const [row] = await db
      .select({
        documentId: users.documentId,
        name: users.name,
        lastName: users.lastName,
        avatar: users.avatar,
        phone: users.phone,
        birthday: users.birthday,
        nationalId: users.nationalId,
        taxId: users.taxId,
        email: accounts.email,
        addressLine: addresses.address,
        streetNumber: addresses.streetNumber,
        state: addresses.state,
        city: addresses.city,
      })
      .from(users)
      .innerJoin(userAccountsLnk, eq(userAccountsLnk.userId, users.id))
      .innerJoin(accounts, eq(accounts.id, userAccountsLnk.accountId))
      .leftJoin(userAddressesLnk, eq(userAddressesLnk.userId, users.id))
      .leftJoin(addresses, eq(addresses.id, userAddressesLnk.addressId))
      .where(eq(users.documentId, documentId))
      .limit(1)

    if (!row) {
      throw new NotFoundException(USER_MESSAGE.NOT_FOUND)
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
      address: toCurrentUserAddress(row),
    }
  }

  async updateCurrentUser(
    documentId: string,
    input: UpdateCurrentUserInput
  ): Promise<CurrentUserResponse> {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.documentId, documentId))
      .limit(1)

    if (!existing) {
      throw new NotFoundException(USER_MESSAGE.NOT_FOUND)
    }

    await db
      .update(users)
      .set({
        name: input.name,
        lastName: input.lastName,
        phone: input.phone,
        birthday: input.birthday || null,
        nationalId: input.nationalId || null,
        taxId: input.taxId || null,
        updatedAt: new Date(),
      })
      .where(eq(users.documentId, documentId))

    await this.upsertUserAddress(existing.id, input.address)

    return this.getCurrentUser(documentId)
  }

  private async upsertUserAddress(
    userId: number,
    input: UpdateCurrentUserInput['address']
  ): Promise<void> {
    const addressValues = {
      address: input.address.trim(),
      streetNumber: input.streetNumber.trim(),
      state: input.state.trim(),
      city: input.city.trim(),
    }

    const hasAddressContent = Object.values(addressValues).some((value) => value.length > 0)
    if (!hasAddressContent) {
      return
    }

    const [link] = await db
      .select({ addressId: userAddressesLnk.addressId })
      .from(userAddressesLnk)
      .where(eq(userAddressesLnk.userId, userId))
      .limit(1)

    const now = new Date()

    if (link) {
      await db
        .update(addresses)
        .set({ ...addressValues, updatedAt: now })
        .where(eq(addresses.id, link.addressId))
      return
    }

    const [insertedAddress] = await db
      .insert(addresses)
      .values({
        documentId: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        ...addressValues,
      })
      .returning({ id: addresses.id })

    await db.insert(userAddressesLnk).values({
      documentId: crypto.randomUUID(),
      userId,
      addressId: insertedAddress.id,
      createdAt: now,
      updatedAt: now,
    })
  }
}
