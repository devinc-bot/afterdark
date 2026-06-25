import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common'
import type { CreateStaffInvitationResponse, JwtPayload } from '@afterdark/types'
import { createStaffInvitationSchema, type CreateStaffInvitationInput } from '@afterdark/validators'
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
}
