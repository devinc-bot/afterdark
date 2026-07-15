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
import { API_ROUTES } from '@afterdark/common'
import type { JwtPayload, StaffPersonnelItem } from '@afterdark/types'
import { USER_ROLE } from '@afterdark/types'
import {
  updateStaffStatusSchema,
  uuidSchema,
  type UpdateStaffStatusInput,
} from '@afterdark/validators'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { DeleteStaffUseCase } from '../application/delete-staff.use-case'
import { ListPersonnelForOwnerUseCase } from '../application/list-personnel-for-owner.use-case'
import { UpdateStaffStatusUseCase } from '../application/update-staff-status.use-case'

@Controller(API_ROUTES.staff.prefix)
export class StaffController {
  constructor(
    @Inject(ListPersonnelForOwnerUseCase)
    private readonly listPersonnelForOwner: ListPersonnelForOwnerUseCase,
    @Inject(UpdateStaffStatusUseCase) private readonly updateStaffStatus: UpdateStaffStatusUseCase,
    @Inject(DeleteStaffUseCase) private readonly deleteStaff: DeleteStaffUseCase
  ) {}

  @Get(API_ROUTES.staff.path.listMyPersonnel())
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  listMyPersonnel(@CurrentUser() user: JwtPayload): Promise<StaffPersonnelItem[]> {
    return this.listPersonnelForOwner.execute(user.sub)
  }

  @Patch(API_ROUTES.staff.path.updateStatus(':documentId'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string,
    @Body(new ZodValidationPipe(updateStaffStatusSchema)) body: UpdateStaffStatusInput
  ): Promise<void> {
    return this.updateStaffStatus.execute(user.sub, documentId, body.status)
  }

  @Delete(API_ROUTES.staff.path.delete(':documentId'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles([USER_ROLE.OWNER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  delete(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string
  ): Promise<void> {
    return this.deleteStaff.execute(user.sub, documentId)
  }
}
