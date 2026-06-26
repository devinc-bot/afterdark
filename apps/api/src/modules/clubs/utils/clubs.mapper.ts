import { BadRequestException } from '@nestjs/common'
import type { AddressSelect, AssetSelect, ClubSelect } from '@afterdark/db'
import type { ClubImageResponse, ClubResponse } from '@afterdark/types'
import {
  CLUB_IMAGE_MAX_COUNT,
  type CreateClubInput,
  type UpdateClubInput,
} from '@afterdark/validators'
import { CLUB_MESSAGE } from '../clubs.constants'

export function toClubImageResponse(asset: AssetSelect): ClubImageResponse {
  return {
    documentId: asset.documentId,
    name: asset.name,
    url: asset.url ?? '',
  }
}

export function toClubResponse(
  club: ClubSelect,
  address: AddressSelect,
  images: ClubImageResponse[] = []
): ClubResponse {
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
    images,
    createdAt: club.createdAt,
    updatedAt: club.updatedAt,
  }
}

export function toClubUpsertInput(input: CreateClubInput | UpdateClubInput) {
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

export function groupClubImagesByClubId(
  imageRows: { clubId: number; asset: AssetSelect }[]
): Map<number, ClubImageResponse[]> {
  const map = new Map<number, ClubImageResponse[]>()

  for (const { clubId, asset } of imageRows) {
    const images = map.get(clubId) ?? []

    images.push(toClubImageResponse(asset))

    map.set(clubId, images)
  }

  return map
}

export function assertValidKeepImageIds(
  currentImageDocumentIds: Iterable<string>,
  keepImageIds: string[]
): void {
  const currentIds = new Set(currentImageDocumentIds)

  for (const documentId of keepImageIds) {
    if (!currentIds.has(documentId)) {
      throw new BadRequestException(CLUB_MESSAGE.INVALID_IMAGE_IDS)
    }
  }
}

export function validateImageLimit(keepImageIds: string[], files: Express.Multer.File[]): void {
  if (keepImageIds.length + files.length > CLUB_IMAGE_MAX_COUNT) {
    throw new BadRequestException(CLUB_MESSAGE.TOO_MANY_IMAGES)
  }
}
