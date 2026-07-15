import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { USER_ROLE, type JwtPayload, type SettingsResponse } from '@afterdark/types'
import type { UpdateCurrentOwnerInput, UpdateCurrentStaffInput } from '@afterdark/validators'
import { TranslationService } from '@afterdark/i18n/server'
import { UpdateCurrentOwnerUseCase } from '../../owner'
import { UpdateCurrentStaffUseCase } from '../../staff'

@Injectable()
export class UpdateSettingsUseCase {
  constructor(
    @Inject(TranslationService) private readonly ts: TranslationService,
    @Inject(UpdateCurrentOwnerUseCase)
    private readonly updateCurrentOwner: UpdateCurrentOwnerUseCase,
    @Inject(UpdateCurrentStaffUseCase)
    private readonly updateCurrentStaff: UpdateCurrentStaffUseCase
  ) {}

  async execute(
    user: JwtPayload,
    input: UpdateCurrentOwnerInput | UpdateCurrentStaffInput
  ): Promise<SettingsResponse> {
    if (user.role === USER_ROLE.OWNER) {
      return this.updateCurrentOwner.execute(user.sub, input as UpdateCurrentOwnerInput)
    }

    if (user.role === USER_ROLE.STAFF) {
      return this.updateCurrentStaff.execute(user.sub, input as UpdateCurrentStaffInput)
    }

    throw new ForbiddenException(this.ts.translateError('forbidden'))
  }
}
