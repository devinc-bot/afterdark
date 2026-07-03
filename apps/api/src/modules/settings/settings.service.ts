import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { USER_ROLE, type JwtPayload, type SettingsResponse } from '@afterdark/types'
import type { UpdateCurrentOwnerInput } from '@afterdark/validators'
import { TranslationService } from '@afterdark/i18n/server'
import { OwnerService } from '../owner/owner.service'

@Injectable()
export class SettingsService {
  constructor(
    @Inject(TranslationService) private readonly ts: TranslationService,
    @Inject(OwnerService) private readonly ownerService: OwnerService
  ) {}

  async getSettings(user: JwtPayload): Promise<SettingsResponse> {
    if (user.role === USER_ROLE.OWNER) {
      return this.ownerService.getCurrentOwner(user.sub)
    }

    if (user.role === USER_ROLE.STAFF) {
      return { role: USER_ROLE.STAFF }
    }

    throw new ForbiddenException(this.ts.translateError('forbidden'))
  }

  async updateSettings(
    user: JwtPayload,
    input: UpdateCurrentOwnerInput
  ): Promise<SettingsResponse> {
    if (user.role === USER_ROLE.OWNER) {
      return this.ownerService.updateCurrentOwner(user.sub, input)
    }

    if (user.role === USER_ROLE.STAFF) {
      return { role: USER_ROLE.STAFF }
    }

    throw new ForbiddenException(this.ts.translateError('forbidden'))
  }
}
