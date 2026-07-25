import { Injectable } from '@nestjs/common'
import {
  findLocationImageAssetsByLocationIds,
  findLocationsWithAddressesByOwnerDocumentId,
} from '@repo/db'
import type { LocationResponse } from '@repo/types'
import { groupLocationImagesByLocationId, toLocationResponse } from '../mappers/location.mapper'

@Injectable()
export class ListMyLocationsUseCase {
  async execute(ownerDocumentId: string): Promise<LocationResponse[]> {
    const rows = await findLocationsWithAddressesByOwnerDocumentId(ownerDocumentId)
    const locationIds = rows.map(({ location }) => location.id)
    const imageRows = await findLocationImageAssetsByLocationIds(locationIds)
    const imagesByLocationId = groupLocationImagesByLocationId(imageRows)

    return rows.map(({ location, address }) =>
      toLocationResponse(location, address, imagesByLocationId.get(location.id) ?? [])
    )
  }
}
