import { Body, Controller, Get, Inject, Param, Post, Put, UseGuards } from '@nestjs/common'
import { API_ROUTES } from '@repo/common'
import {
  USER_ROLE,
  type AcceptLegalDocumentsInput,
  type JwtPayload,
  type LegalDocumentByTypeResponse,
  type LegalDocumentResponse,
  type LegalDocumentType,
  type PendingLegalAcceptanceResponse,
  type PublicLegalDocumentResponse,
} from '@repo/types'
import {
  acceptLegalDocumentsSchema,
  legalDocumentTypeSchema,
  publishLegalDocumentSchema,
  saveLegalDocumentDraftSchema,
  type SaveLegalDocumentDraftInput,
} from '@repo/validators'
import { ApiRateLimit } from '../../common/decorators/api-rate-limit.decorator'
import { AllowStaleLegalAcceptance } from '../../common/decorators/allow-stale-legal-acceptance.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { RATE_LIMIT_PROFILE } from '../../../config/rate-limit.policy'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { AcceptLegalDocumentsUseCase } from '../application/accept-legal-documents.use-case'
import { GetLegalDocumentByTypeUseCase } from '../application/get-legal-document-by-type.use-case'
import { GetPendingLegalAcceptanceUseCase } from '../application/get-pending-legal-acceptance.use-case'
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
    private readonly getPublishedLegalDocumentByType: GetPublishedLegalDocumentByTypeUseCase,
    @Inject(GetPendingLegalAcceptanceUseCase)
    private readonly getPendingLegalAcceptance: GetPendingLegalAcceptanceUseCase,
    @Inject(AcceptLegalDocumentsUseCase)
    private readonly acceptLegalDocuments: AcceptLegalDocumentsUseCase
  ) {}

  @Get(API_ROUTES.legalDocuments.path.list())
  @Roles([USER_ROLE.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiRateLimit(RATE_LIMIT_PROFILE.AUTHENTICATED)
  list(): Promise<LegalDocumentByTypeResponse[]> {
    return this.listLegalDocuments.execute()
  }

  @Get(API_ROUTES.legalDocuments.path.getPublishedByType(':type'))
  @AllowStaleLegalAcceptance()
  getPublishedByType(
    @Param('type', new ZodValidationPipe(legalDocumentTypeSchema)) type: LegalDocumentType
  ): Promise<PublicLegalDocumentResponse> {
    return this.getPublishedLegalDocumentByType.execute(type)
  }

  @Get(API_ROUTES.legalDocuments.path.getPendingAcceptance())
  @AllowStaleLegalAcceptance()
  @Roles([USER_ROLE.USER, USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiRateLimit(RATE_LIMIT_PROFILE.AUTHENTICATED)
  getPendingAcceptance(@CurrentUser() user: JwtPayload): Promise<PendingLegalAcceptanceResponse> {
    return this.getPendingLegalAcceptance.execute(user.sub, user.role)
  }

  @Post(API_ROUTES.legalDocuments.path.accept())
  @AllowStaleLegalAcceptance()
  @Roles([USER_ROLE.USER, USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiRateLimit(RATE_LIMIT_PROFILE.AUTHENTICATED)
  accept(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(acceptLegalDocumentsSchema)) body: AcceptLegalDocumentsInput
  ): Promise<PendingLegalAcceptanceResponse> {
    return this.acceptLegalDocuments.execute(user.sub, user.role, body)
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
