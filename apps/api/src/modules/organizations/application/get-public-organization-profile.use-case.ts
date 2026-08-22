import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import {
  findEventImageAssetsByEventIds,
  findPublicOrganizationBySlug,
  findPublishedEventsPaginated,
} from '@repo/db'
import { TranslationService } from '@repo/i18n/server'
import type { PublicOrganizationProfileResponse } from '@repo/types'
import type { ListPublicEventsQueryInput } from '@repo/validators'
import {
  groupEventImagesByEventId,
  toPublicEventResponse,
} from '../../events/mappers/events.mapper'

@Injectable()
export class GetPublicOrganizationProfileUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(
    slug: string,
    query: ListPublicEventsQueryInput
  ): Promise<PublicOrganizationProfileResponse> {
    try {
      const organization = await findPublicOrganizationBySlug(slug)
      if (!organization) {
        throw new NotFoundException(this.ts.translateError('organization.NOT_FOUND'))
      }

      const { rows, total } = await findPublishedEventsPaginated({
        ...query,
        organizationId: organization.id,
      })
      const imagesByEventId = groupEventImagesByEventId(
        await findEventImageAssetsByEventIds(rows.map(({ event }) => event.id))
      )

      return {
        documentId: organization.documentId,
        slug: organization.slug,
        name: organization.name,
        avatar: organization.avatar ?? null,
        events: {
          data: rows.map(({ event, location, address }) =>
            toPublicEventResponse(event, location, address, imagesByEventId.get(event.id) ?? [])
          ),
          total,
          page: query.page,
          limit: query.limit,
          totalPages: total === 0 ? total : Math.ceil(total / query.limit),
        },
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }

      throw new InternalServerErrorException(this.ts.translateError('organization.GET_FAILED'))
    }
  }
}
