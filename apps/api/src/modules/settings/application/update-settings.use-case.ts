import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { USER_ROLE, type JwtPayload, type SettingsResponse } from '@repo/types'
import type {
  UpdateCurrentOwnerInput,
  UpdateCurrentStaffInput,
  UpdateCurrentUserProfileInput,
} from '@repo/validators'
import { TranslationService } from '@repo/i18n/server'
import { UpdateCurrentOwnerUseCase } from '../../owner'
import { UpdateCurrentStaffUseCase } from '../../staff'
import { UpdateCurrentUserUseCase } from '../../users'

@Injectable()
export class UpdateSettingsUseCase {
  constructor(
    @Inject(TranslationService) private readonly ts: TranslationService,
    @Inject(UpdateCurrentOwnerUseCase)
    private readonly updateCurrentOwner: UpdateCurrentOwnerUseCase,
    @Inject(UpdateCurrentStaffUseCase)
    private readonly updateCurrentStaff: UpdateCurrentStaffUseCase,
    @Inject(UpdateCurrentUserUseCase)
    private readonly updateCurrentUser: UpdateCurrentUserUseCase
  ) {}

  async execute(
    user: JwtPayload,
    input: UpdateCurrentOwnerInput | UpdateCurrentStaffInput | UpdateCurrentUserProfileInput
  ): Promise<SettingsResponse> {
    if (user.role === USER_ROLE.OWNER) {
      return this.updateCurrentOwner.execute(user.sub, input as UpdateCurrentOwnerInput)
    }

    if (user.role === USER_ROLE.STAFF) {
      return this.updateCurrentStaff.execute(user.sub, input as UpdateCurrentStaffInput)
    }

    if (user.role === USER_ROLE.USER) {
      return this.updateCurrentUser.execute(user.sub, input as UpdateCurrentUserProfileInput)
    }

    throw new ForbiddenException(this.ts.translateError('forbidden'))
  }
}
