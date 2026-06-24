import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { desc, eq } from 'drizzle-orm'
import {
  addresses,
  clubAddressesLnk,
  clubAssetsLnk,
  clubs,
  db,
  owners,
  type AddressSelect,
  type ClubSelect,
  type Transaction,
} from '@afterdark/db'
import type { ClubResponse } from '@afterdark/types'
import type { CreateClubInput, UpdateClubInput } from '@afterdark/validators'
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
  async listClubs(): Promise<ClubResponse[]> {
    const rows = await db
      .select({
        club: clubs,
        address: addresses,
      })
      .from(clubs)
      .innerJoin(clubAddressesLnk, eq(clubAddressesLnk.clubId, clubs.id))
      .innerJoin(addresses, eq(addresses.id, clubAddressesLnk.addressId))
      .orderBy(desc(clubs.createdAt))

    return rows.map(({ club, address }) => toClubResponse(club, address))
  }

  async createClub(ownerDocumentId: string, input: CreateClubInput): Promise<ClubResponse> {
    const [owner] = await db
      .select({ id: owners.id })
      .from(owners)
      .where(eq(owners.documentId, ownerDocumentId))
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
          ownerId: owner.id,
          status: input.status,
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

  async updateClub(documentId: string, input: UpdateClubInput): Promise<ClubResponse> {
    const [existing] = await db
      .select({ id: clubs.id })
      .from(clubs)
      .where(eq(clubs.documentId, documentId))
      .limit(1)

    if (!existing) {
      throw new NotFoundException(CLUB_MESSAGE.NOT_FOUND)
    }

    const row = await db.transaction(async (tx) => {
      const now = new Date()

      const [club] = await tx
        .update(clubs)
        .set({
          name: input.name,
          capacity: input.capacity,
          description: input.description,
          status: input.status,
          updatedAt: now,
        })
        .where(eq(clubs.documentId, documentId))
        .returning()

      if (!club) {
        throw new InternalServerErrorException(CLUB_MESSAGE.UPDATE_FAILED)
      }

      const [link] = await tx
        .select({ addressId: clubAddressesLnk.addressId })
        .from(clubAddressesLnk)
        .where(eq(clubAddressesLnk.clubId, existing.id))
        .limit(1)

      if (!link) {
        throw new InternalServerErrorException(CLUB_MESSAGE.UPDATE_FAILED)
      }

      const [address] = await tx
        .update(addresses)
        .set({
          address: input.address,
          streetNumber: input.street_number,
          state: input.state,
          city: input.city,
          updatedAt: now,
        })
        .where(eq(addresses.id, link.addressId))
        .returning()

      if (!address) {
        throw new InternalServerErrorException(CLUB_MESSAGE.UPDATE_FAILED)
      }

      return { club, address }
    })

    return toClubResponse(row.club, row.address)
  }

  async deleteClub(documentId: string): Promise<void> {
    const [existing] = await db
      .select({ id: clubs.id })
      .from(clubs)
      .where(eq(clubs.documentId, documentId))
      .limit(1)

    if (!existing) {
      throw new NotFoundException(CLUB_MESSAGE.NOT_FOUND)
    }

    await db.transaction(async (tx) => {
      const [link] = await tx
        .select({ addressId: clubAddressesLnk.addressId })
        .from(clubAddressesLnk)
        .where(eq(clubAddressesLnk.clubId, existing.id))
        .limit(1)

      await tx.delete(clubAssetsLnk).where(eq(clubAssetsLnk.clubId, existing.id))
      await tx.delete(clubAddressesLnk).where(eq(clubAddressesLnk.clubId, existing.id))

      const [deletedClub] = await tx
        .delete(clubs)
        .where(eq(clubs.id, existing.id))
        .returning({ id: clubs.id })

      if (!deletedClub) {
        throw new InternalServerErrorException(CLUB_MESSAGE.DELETE_FAILED)
      }

      if (link) {
        await tx.delete(addresses).where(eq(addresses.id, link.addressId))
      }
    })
  }
}
