import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { clubs, db, type ClubSelect } from '@afterdark/db'
import type { ClubResponse } from '@afterdark/types'
import type { CreateClubInput } from '@afterdark/validators'
import { CLUB_MESSAGE } from './clubs.constants'

function toClubResponse(club: ClubSelect): ClubResponse {
  return {
    documentId: club.documentId,
    name: club.name,
    capacity: club.capacity,
    description: club.description,
    status: club.status,
    address: club.address,
    streetNumber: club.streetNumber,
    state: club.state,
    city: club.city,
    createdAt: club.createdAt,
    updatedAt: club.updatedAt,
  }
}

@Injectable()
export class ClubsService {
  async createClub(input: CreateClubInput): Promise<ClubResponse> {
    const [club] = await db
      .insert(clubs)
      .values({
        name: input.name,
        address: input.address,
        capacity: input.capacity,
        description: input.description,
        state: input.state,
        streetNumber: input.street_number,
        city: input.city,
      })
      .returning()

    if (!club) {
      throw new InternalServerErrorException(CLUB_MESSAGE.CREATE_FAILED)
    }

    return toClubResponse(club)
  }
}
