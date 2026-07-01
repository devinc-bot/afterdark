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

@Controller('invitations')
export class InvitationsController {
  constructor(
    @Inject(InvitationsService) private readonly invitationsService: InvitationsService
  ) {}

  @Post('staff')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  createStaffInvitation(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createStaffInvitationSchema)) body: CreateStaffInvitationInput
  ): Promise<CreateStaffInvitationResponse> {
    return this.invitationsService.createStaffInvitation(user.sub, body)
  }

  @Get('staff')
  @UseGuards(JwtAuthGuard)
  listStaffInvitations(@CurrentUser() user: JwtPayload): Promise<CreateStaffInvitationResponse[]> {
    return this.invitationsService.listStaffInvitations(user.sub)
  }

  @Post('staff/:slug/:token/accept')
  @HttpCode(HttpStatus.OK)
  acceptStaffInvitation(
    @Param('slug') slug: string,
    @Param('token') token: string,
    @Body(new ZodValidationPipe(acceptStaffInvitationApiSchema)) body: AcceptStaffInvitationApiInput
  ): Promise<{ message: string }> {
    return this.invitationsService.acceptStaffInvitation(slug, token, body)
  }

  @Get('staff/:slug/:token')
  getStaffInvitationByLink(
    @Param('slug') slug: string,
    @Param('token') token: string
  ): Promise<StaffInvitationPublicResponse> {
    return this.invitationsService.getStaffInvitationByLink(slug, token)
  }

  @Delete('staff/:documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  deleteStaffInvitation(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string
  ): Promise<void> {
    return this.invitationsService.deleteStaffInvitation(user.sub, documentId)
  }
}
