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
import { USER_ROLE } from '@afterdark/types'
import {
  updateStaffStatusSchema,
  uuidSchema,
  type UpdateStaffStatusInput,
} from '@afterdark/validators'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { StaffService } from './staff.service'

@Controller('staff')
export class StaffController {
  constructor(@Inject(StaffService) private readonly staffService: StaffService) {}

  @Get('my-personnel')
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  listMyPersonnel(@CurrentUser() user: JwtPayload): Promise<StaffPersonnelItem[]> {
    return this.staffService.listPersonnelForOwner(user.sub)
  }

  @Patch(':documentId/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string,
    @Body(new ZodValidationPipe(updateStaffStatusSchema)) body: UpdateStaffStatusInput
  ): Promise<void> {
    return this.staffService.updateStaffStatus(user.sub, documentId, body.status)
  }

  @Delete(':documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  delete(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string
  ): Promise<void> {
    return this.staffService.deleteStaff(user.sub, documentId)
  }
}
