import { Body, Controller, Get, Inject, Param, Post, Put, UseGuards } from '@nestjs/common'
import { API_ROUTES } from '@repo/common'
import {
  USER_ROLE,
  type LegalDocumentByTypeResponse,
  type LegalDocumentResponse,
  type LegalDocumentType,
  type PublicLegalDocumentResponse,
} from '@repo/types'
import {
  legalDocumentTypeSchema,
  publishLegalDocumentSchema,
  saveLegalDocumentDraftSchema,
  type SaveLegalDocumentDraftInput,
} from '@repo/validators'
import { ApiRateLimit } from '../../common/decorators/api-rate-limit.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { RATE_LIMIT_PROFILE } from '../../../config/rate-limit.policy'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { GetLegalDocumentByTypeUseCase } from '../application/get-legal-document-by-type.use-case'
import { GetPublishedLegalDocumentByTypeUseCase } from '../application/get-published-legal-document-by-type.use-case'
import { ListLegalDocumentsUseCase } from '../application/list-legal-documents.use-case'
import { PublishLegalDocumentUseCase } from '../application/publish-legal-document.use-case'
import { SaveLegalDocumentDraftUseCase } from '../application/save-legal-document-draft.use-case'

@Controller(API_ROUTES.legalDocuments.prefix)
export class LegalDocumentsController {
  constructor(
    @Inject(ListLegalDocumentsUseCase)
    private readonly listLegalDocuments: ListLegalDocumentsUseCase,
    @Inject(GetLegalDocumentByTypeUseCase)
    private readonly getLegalDocumentByType: GetLegalDocumentByTypeUseCase,
    @Inject(SaveLegalDocumentDraftUseCase)
    private readonly saveLegalDocumentDraft: SaveLegalDocumentDraftUseCase,
    @Inject(PublishLegalDocumentUseCase)
    private readonly publishLegalDocument: PublishLegalDocumentUseCase,
    @Inject(GetPublishedLegalDocumentByTypeUseCase)
    private readonly getPublishedLegalDocumentByType: GetPublishedLegalDocumentByTypeUseCase
  ) {}

  @Get(API_ROUTES.legalDocuments.path.list())
  @Roles([USER_ROLE.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiRateLimit(RATE_LIMIT_PROFILE.AUTHENTICATED)
  list(): Promise<LegalDocumentByTypeResponse[]> {
    return this.listLegalDocuments.execute()
  }

  @Get(API_ROUTES.legalDocuments.path.getPublishedByType(':type'))
  getPublishedByType(
    @Param('type', new ZodValidationPipe(legalDocumentTypeSchema)) type: LegalDocumentType
  ): Promise<PublicLegalDocumentResponse> {
    return this.getPublishedLegalDocumentByType.execute(type)
  }

  @Get(API_ROUTES.legalDocuments.path.getByType(':type'))
  @Roles([USER_ROLE.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiRateLimit(RATE_LIMIT_PROFILE.AUTHENTICATED)
  get(
    @Param('type', new ZodValidationPipe(legalDocumentTypeSchema)) type: LegalDocumentType
  ): Promise<LegalDocumentByTypeResponse> {
    return this.getLegalDocumentByType.execute(type)
  }

  @Put(API_ROUTES.legalDocuments.path.saveDraft(':type'))
  @Roles([USER_ROLE.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiRateLimit(RATE_LIMIT_PROFILE.AUTHENTICATED)
  saveDraft(
    @Param('type', new ZodValidationPipe(legalDocumentTypeSchema)) type: LegalDocumentType,
    @Body(new ZodValidationPipe(saveLegalDocumentDraftSchema)) body: SaveLegalDocumentDraftInput
  ): Promise<LegalDocumentResponse> {
    return this.saveLegalDocumentDraft.execute(type, body)
  }

  @Post(API_ROUTES.legalDocuments.path.publish(':type'))
  @Roles([USER_ROLE.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiRateLimit(RATE_LIMIT_PROFILE.AUTHENTICATED)
  publish(
    @Param('type', new ZodValidationPipe(publishLegalDocumentSchema)) type: LegalDocumentType
  ): Promise<LegalDocumentResponse> {
    return this.publishLegalDocument.execute(type)
  }
}
