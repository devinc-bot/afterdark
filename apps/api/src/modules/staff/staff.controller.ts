import { Controller, Get, Inject, UseGuards } from '@nestjs/common'
import type { JwtPayload, StaffPersonnelItem } from '@afterdark/types'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { OwnerRoleGuard } from '../../common/guards/owner-role.guard'
import { StaffService } from './staff.service'

@Controller('staff')
export class StaffController {
  constructor(@Inject(StaffService) private readonly staffService: StaffService) {}

  @Get('my-personnel')
  @UseGuards(JwtAuthGuard, OwnerRoleGuard)
  listMyPersonnel(@CurrentUser() user: JwtPayload): Promise<StaffPersonnelItem[]> {
    return this.staffService.listPersonnelForOwner(user.sub)
  }
}
