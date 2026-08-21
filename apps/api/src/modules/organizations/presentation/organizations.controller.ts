import { Controller, Get, Inject, Param, Query } from '@nestjs/common'
import { API_ROUTES } from '@repo/common'
import type { PublicOrganizationProfileResponse } from '@repo/types'
import {
  listPublicEventsQuerySchema,
  uuidSchema,
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

  @Get(API_ROUTES.organizations.path.getPublic(':documentId'))
  getPublicByDocumentId(
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string,
    @Query(new ZodValidationPipe(listPublicEventsQuerySchema)) query: ListPublicEventsQueryInput
  ): Promise<PublicOrganizationProfileResponse> {
    return this.getPublicOrganizationProfileUseCase.execute(documentId, query)
  }
}
