import { Controller, Get, Inject, Param, Query } from '@nestjs/common'
import { API_ROUTES } from '@repo/common'
import type { PublicOrganizationProfileResponse } from '@repo/types'
import {
  listPublicEventsQuerySchema,
  slugSchema,
  type ListPublicEventsQueryInput,
} from '@repo/validators'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { GetPublicOrganizationProfileUseCase } from '../application/get-public-organization-profile.use-case'

@Controller(API_ROUTES.organizations.prefix)
export class OrganizationsController {
  constructor(
    @Inject(GetPublicOrganizationProfileUseCase)
    private readonly getPublicOrganizationProfileUseCase: GetPublicOrganizationProfileUseCase
  ) {}

  @Get(API_ROUTES.organizations.path.getPublic(':slug'))
  getPublicBySlug(
    @Param('slug', new ZodValidationPipe(slugSchema)) slug: string,
    @Query(new ZodValidationPipe(listPublicEventsQuerySchema)) query: ListPublicEventsQueryInput
  ): Promise<PublicOrganizationProfileResponse> {
    return this.getPublicOrganizationProfileUseCase.execute(slug, query)
  }
}
