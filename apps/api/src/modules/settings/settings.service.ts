import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { USER_ROLE, type JwtPayload, type SettingsResponse } from '@afterdark/types'
import type { UpdateCurrentOwnerInput, UpdateCurrentStaffInput } from '@afterdark/validators'
import { TranslationService } from '@afterdark/i18n/server'
import { OwnerService } from '../owner/owner.service'
import { StaffService } from '../staff/staff.service'

@Injectable()
export class SettingsService {
  constructor(
    @Inject(TranslationService) private readonly ts: TranslationService,
    @Inject(OwnerService) private readonly ownerService: OwnerService,
    @Inject(StaffService) private readonly staffService: StaffService
  ) {}

  async getSettings(user: JwtPayload): Promise<SettingsResponse> {
    if (user.role === USER_ROLE.OWNER) {
      return this.ownerService.getCurrentOwner(user.sub)
    }

    if (user.role === USER_ROLE.STAFF) {
      return this.staffService.getCurrentStaff(user.sub)
    }

    throw new ForbiddenException(this.ts.translateError('forbidden'))
  }

  async updateSettings(
    user: JwtPayload,
    input: UpdateCurrentOwnerInput | UpdateCurrentStaffInput
  ): Promise<SettingsResponse> {
    if (user.role === USER_ROLE.OWNER) {
      return this.ownerService.updateCurrentOwner(user.sub, input as UpdateCurrentOwnerInput)
    }

    if (user.role === USER_ROLE.STAFF) {
      return this.staffService.updateCurrentStaff(user.sub, input as UpdateCurrentStaffInput)
    }

    throw new ForbiddenException(this.ts.translateError('forbidden'))
  }
}
