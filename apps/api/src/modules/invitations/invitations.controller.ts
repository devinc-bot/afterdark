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
import type {
  CreateStaffInvitationResponse,
  JwtPayload,
  StaffInvitationPublicResponse,
} from '@afterdark/types'
import {
  acceptStaffInvitationApiSchema,
  createStaffInvitationSchema,
  uuidSchema,
  type AcceptStaffInvitationApiInput,
  type CreateStaffInvitationInput,
} from '@afterdark/validators'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { InvitationsService } from './invitations.service'
import { API_ROUTES } from '@afterdark/common'

@Controller(API_ROUTES.invitations.prefix)
export class InvitationsController {
  constructor(
    @Inject(InvitationsService) private readonly invitationsService: InvitationsService
  ) {}

  @Post(API_ROUTES.invitations.path.staff())
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  createStaffInvitation(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createStaffInvitationSchema)) body: CreateStaffInvitationInput
  ): Promise<CreateStaffInvitationResponse> {
    return this.invitationsService.createStaffInvitation(user.sub, body)
  }

  @Get(API_ROUTES.invitations.path.staff())
  @UseGuards(JwtAuthGuard)
  listStaffInvitations(@CurrentUser() user: JwtPayload): Promise<CreateStaffInvitationResponse[]> {
    return this.invitationsService.listStaffInvitations(user.sub)
  }

  @Post(API_ROUTES.invitations.path.acceptStaff(':slug', ':token'))
  @HttpCode(HttpStatus.OK)
  acceptStaffInvitation(
    @Param('slug') slug: string,
    @Param('token') token: string,
    @Body(new ZodValidationPipe(acceptStaffInvitationApiSchema)) body: AcceptStaffInvitationApiInput
  ): Promise<{ message: string }> {
    return this.invitationsService.acceptStaffInvitation(slug, token, body)
  }

  @Get(API_ROUTES.invitations.path.staffByLink(':slug', ':token'))
  getStaffInvitationByLink(
    @Param('slug') slug: string,
    @Param('token') token: string
  ): Promise<StaffInvitationPublicResponse> {
    return this.invitationsService.getStaffInvitationByLink(slug, token)
  }

  @Delete(API_ROUTES.invitations.path.deleteStaff(':documentId'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  deleteStaffInvitation(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string
  ): Promise<void> {
    return this.invitationsService.deleteStaffInvitation(user.sub, documentId)
  }
}
