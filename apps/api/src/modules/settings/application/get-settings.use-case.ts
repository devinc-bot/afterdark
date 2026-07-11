import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { USER_ROLE, type JwtPayload, type SettingsResponse } from '@afterdark/types'
import { TranslationService } from '@afterdark/i18n/server'
import { GetCurrentOwnerUseCase } from '../../owner'
import { GetCurrentStaffUseCase } from '../../staff'

@Injectable()
export class GetSettingsUseCase {
  constructor(
    @Inject(TranslationService) private readonly ts: TranslationService,
    @Inject(GetCurrentOwnerUseCase) private readonly getCurrentOwner: GetCurrentOwnerUseCase,
    @Inject(GetCurrentStaffUseCase) private readonly getCurrentStaff: GetCurrentStaffUseCase
  ) {}

  async execute(user: JwtPayload): Promise<SettingsResponse> {
    if (user.role === USER_ROLE.OWNER) {
      return this.getCurrentOwner.execute(user.sub)
    }

    if (user.role === USER_ROLE.STAFF) {
      return this.getCurrentStaff.execute(user.sub)
    }

    throw new ForbiddenException(this.ts.translateError('forbidden'))
  }
}
