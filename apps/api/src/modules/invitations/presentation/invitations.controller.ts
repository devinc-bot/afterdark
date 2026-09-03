import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { API_ROUTES } from '@repo/common'
import type {
  CreateStaffInvitationResponse,
  JwtPayload,
  StaffInvitationPublicResponse,
} from '@repo/types'
import {
  acceptStaffInvitationApiSchema,
  createStaffInvitationSchema,
  uuidSchema,
  type AcceptStaffInvitationApiInput,
  type CreateStaffInvitationInput,
} from '@repo/validators'
import { ApiRateLimit } from '../../common/decorators/api-rate-limit.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RATE_LIMIT_PROFILE } from '../../../config/rate-limit.policy'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { AcceptStaffInvitationUseCase } from '../application/accept-staff-invitation.use-case'
import { CreateStaffInvitationUseCase } from '../application/create-staff-invitation.use-case'
import { DeleteStaffInvitationUseCase } from '../application/delete-staff-invitation.use-case'
import { GetStaffInvitationByLinkUseCase } from '../application/get-staff-invitation-by-link.use-case'
import { ListStaffInvitationsUseCase } from '../application/list-staff-invitations.use-case'

@Controller(API_ROUTES.invitations.prefix)
export class InvitationsController {
  constructor(
    @Inject(CreateStaffInvitationUseCase)
    private readonly createStaffInvitationUseCase: CreateStaffInvitationUseCase,
    @Inject(ListStaffInvitationsUseCase)
    private readonly listStaffInvitationsUseCase: ListStaffInvitationsUseCase,
    @Inject(DeleteStaffInvitationUseCase)
    private readonly deleteStaffInvitationUseCase: DeleteStaffInvitationUseCase,
    @Inject(AcceptStaffInvitationUseCase)
    private readonly acceptStaffInvitationUseCase: AcceptStaffInvitationUseCase,
    @Inject(GetStaffInvitationByLinkUseCase)
    private readonly getStaffInvitationByLinkUseCase: GetStaffInvitationByLinkUseCase
  ) {}

  @Post(API_ROUTES.invitations.path.staff())
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiRateLimit(RATE_LIMIT_PROFILE.AUTHENTICATED)
  createStaffInvitation(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createStaffInvitationSchema)) body: CreateStaffInvitationInput
  ): Promise<CreateStaffInvitationResponse> {
    return this.createStaffInvitationUseCase.execute(user.sub, body)
  }

  @Get(API_ROUTES.invitations.path.staff())
  @UseGuards(JwtAuthGuard)
  @ApiRateLimit(RATE_LIMIT_PROFILE.AUTHENTICATED)
  listStaffInvitations(@CurrentUser() user: JwtPayload): Promise<CreateStaffInvitationResponse[]> {
    return this.listStaffInvitationsUseCase.execute(user.sub)
  }

  @Post(API_ROUTES.invitations.path.acceptStaff(':slug', ':token'))
  @HttpCode(HttpStatus.OK)
  acceptStaffInvitation(
    @Param('slug') slug: string,
    @Param('token') token: string,
    @Body(new ZodValidationPipe(acceptStaffInvitationApiSchema)) body: AcceptStaffInvitationApiInput
  ): Promise<{ message: string }> {
    return this.acceptStaffInvitationUseCase.execute(slug, token, body)
  }

  @Get(API_ROUTES.invitations.path.staffByLink(':slug', ':token'))
  getStaffInvitationByLink(
    @Param('slug') slug: string,
    @Param('token') token: string
  ): Promise<StaffInvitationPublicResponse> {
    return this.getStaffInvitationByLinkUseCase.execute(slug, token)
  }

  @Delete(API_ROUTES.invitations.path.deleteStaff(':documentId'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiRateLimit(RATE_LIMIT_PROFILE.AUTHENTICATED)
  deleteStaffInvitation(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string
  ): Promise<void> {
    return this.deleteStaffInvitationUseCase.execute(user.sub, documentId)
  }
}
