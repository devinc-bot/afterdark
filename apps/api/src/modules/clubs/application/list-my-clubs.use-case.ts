import { Injectable } from '@nestjs/common'
import {
  findClubImageAssetsByClubIds,
  findClubsWithAddressesByOwnerDocumentId,
} from '@afterdark/db'
import type { ClubResponse } from '@afterdark/types'
import { groupClubImagesByClubId, toClubResponse } from '../mappers/club.mapper'

@Injectable()
export class ListMyClubsUseCase {
  async execute(ownerDocumentId: string): Promise<ClubResponse[]> {
    const clubs = await findClubsWithAddressesByOwnerDocumentId(ownerDocumentId)
    const clubIds = clubs.map(({ club }) => club.id)
    const imageRows = await findClubImageAssetsByClubIds(clubIds)
    const imagesByClubId = groupClubImagesByClubId(imageRows)

    return clubs.map(({ club, address }) =>
      toClubResponse(club, address, imagesByClubId.get(club.id) ?? [])
    )
  }
}
