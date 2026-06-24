import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import {
  createClubWithAddress,
  deleteClubById,
  findClubIdByDocumentId,
  findClubsWithAddressesByOwnerDocumentId,
  findOwnerIdByDocumentId,
  updateClubWithAddress,
  type AddressSelect,
  type ClubSelect,
  type ClubWithAddress,
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

function toClubUpsertInput(input: CreateClubInput | UpdateClubInput) {
  return {
    name: input.name,
    capacity: input.capacity,
    description: input.description,
    status: input.status,
    address: input.address,
    streetNumber: input.street_number,
    state: input.state,
    city: input.city,
  }
}

function mapClubWithAddress({ club, address }: ClubWithAddress): ClubResponse {
  return toClubResponse(club, address)
}

@Injectable()
export class ClubsService {
  async listMyClubs(ownerDocumentId: string): Promise<ClubResponse[]> {
    const rows = await findClubsWithAddressesByOwnerDocumentId(ownerDocumentId)
    return rows.map(mapClubWithAddress)
  }

  async createClub(ownerDocumentId: string, input: CreateClubInput): Promise<ClubResponse> {
    const ownerId = await findOwnerIdByDocumentId(ownerDocumentId)

    if (!ownerId) {
      throw new NotFoundException(CLUB_MESSAGE.OWNER_NOT_FOUND)
    }

    try {
      const row = await createClubWithAddress(ownerId, toClubUpsertInput(input))
      return mapClubWithAddress(row)
    } catch {
      throw new InternalServerErrorException(CLUB_MESSAGE.CREATE_FAILED)
    }
  }

  async updateClub(documentId: string, input: UpdateClubInput): Promise<ClubResponse> {
    const clubId = await findClubIdByDocumentId(documentId)

    if (!clubId) {
      throw new NotFoundException(CLUB_MESSAGE.NOT_FOUND)
    }

    try {
      const row = await updateClubWithAddress(documentId, clubId, toClubUpsertInput(input))
      return mapClubWithAddress(row)
    } catch {
      throw new InternalServerErrorException(CLUB_MESSAGE.UPDATE_FAILED)
    }
  }

  async deleteClub(documentId: string): Promise<void> {
    const clubId = await findClubIdByDocumentId(documentId)

    if (!clubId) {
      throw new NotFoundException(CLUB_MESSAGE.NOT_FOUND)
    }

    try {
      await deleteClubById(clubId)
    } catch {
      throw new InternalServerErrorException(CLUB_MESSAGE.DELETE_FAILED)
    }
  }
}
