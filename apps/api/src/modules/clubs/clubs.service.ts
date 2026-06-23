import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import {
  addresses,
  clubAddressesLnk,
  clubs,
  db,
  users,
  type AddressSelect,
  type ClubSelect,
  type Transaction,
} from '@afterdark/db'
import type { ClubResponse } from '@afterdark/types'
import type { CreateClubInput } from '@afterdark/validators'
import { eq } from 'drizzle-orm'
import { CLUB_MESSAGE } from './clubs.constants'

function toClubResponse(club: ClubSelect, address: AddressSelect): ClubResponse {
  return {
    documentId: club.documentId,
    name: club.name,
    capacity: club.capacity,
    description: club.description,
    status: club.status,
    address: address.address,
    streetNumber: address.streetNumber,
    state: address.state,
    city: address.city,
    createdAt: club.createdAt,
    updatedAt: club.updatedAt,
  }
}

@Injectable()
export class ClubsService {
  async createClub(ownerDocumentId: string, input: CreateClubInput): Promise<ClubResponse> {
    const [owner] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.documentId, ownerDocumentId))
      .limit(1)

    if (!owner) {
      throw new NotFoundException(CLUB_MESSAGE.OWNER_NOT_FOUND)
    }

    const row = await db.transaction(async (tx: Transaction) => {
      const [club] = await tx
        .insert(clubs)
        .values({
          name: input.name,
          capacity: input.capacity,
          description: input.description,
          ownerUserId: owner.id,
        })
        .returning()

      if (!club) {
        throw new InternalServerErrorException(CLUB_MESSAGE.CREATE_FAILED)
      }

      const [address] = await tx
        .insert(addresses)
        .values({
          address: input.address,
          streetNumber: input.street_number,
          state: input.state,
          city: input.city,
        })
        .returning()

      if (!address) {
        throw new InternalServerErrorException(CLUB_MESSAGE.CREATE_FAILED)
      }

      await tx.insert(clubAddressesLnk).values({
        clubId: club.id,
        addressId: address.id,
      })

      return { club, address }
    })

    return toClubResponse(row.club, row.address)
  }
}
