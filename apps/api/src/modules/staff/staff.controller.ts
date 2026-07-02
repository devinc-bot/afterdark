import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common'
import type { JwtPayload, StaffPersonnelItem } from '@afterdark/types'
import {
  updateStaffStatusSchema,
  uuidSchema,
  type UpdateStaffStatusInput,
} from '@afterdark/validators'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { OwnerRoleGuard } from '../common/guards/owner-role.guard'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { StaffService } from './staff.service'

@Controller('staff')
export class StaffController {
  constructor(@Inject(StaffService) private readonly staffService: StaffService) {}

  @Get('my-personnel')
  @UseGuards(JwtAuthGuard, OwnerRoleGuard)
  listMyPersonnel(@CurrentUser() user: JwtPayload): Promise<StaffPersonnelItem[]> {
    return this.staffService.listPersonnelForOwner(user.sub)
  }

  @Patch(':documentId/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, OwnerRoleGuard)
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string,
    @Body(new ZodValidationPipe(updateStaffStatusSchema)) body: UpdateStaffStatusInput
  ): Promise<void> {
    return this.staffService.updateStaffStatus(user.sub, documentId, body.status)
  }

  @Delete(':documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, OwnerRoleGuard)
  delete(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string
  ): Promise<void> {
    return this.staffService.deleteStaff(user.sub, documentId)
  }
}
