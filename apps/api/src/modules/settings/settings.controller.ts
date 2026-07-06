import { Body, Controller, ForbiddenException, Get, Inject, Patch, UseGuards } from '@nestjs/common'
import { USER_ROLE, type JwtPayload, type SettingsResponse } from '@afterdark/types'
import {
  updateCurrentOwnerSchema,
  updateCurrentStaffSchema,
  type UpdateCurrentOwnerInput,
  type UpdateCurrentStaffInput,
} from '@afterdark/validators'
import { TranslationService } from '@afterdark/i18n/server'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { SettingsService } from './settings.service'

@Controller('settings')
export class SettingsController {
  constructor(
    @Inject(SettingsService) private readonly settingsService: SettingsService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getSettings(@CurrentUser() user: JwtPayload): Promise<SettingsResponse> {
    return this.settingsService.getSettings(user)
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  updateSettings(
    @CurrentUser() user: JwtPayload,
    @Body() body: unknown
  ): Promise<SettingsResponse> {
    if (user.role === USER_ROLE.OWNER) {
      const input = new ZodValidationPipe(updateCurrentOwnerSchema).transform(
        body
      ) as UpdateCurrentOwnerInput
      return this.settingsService.updateSettings(user, input)
    }

    if (user.role === USER_ROLE.STAFF) {
      const input = new ZodValidationPipe(updateCurrentStaffSchema).transform(
        body
      ) as UpdateCurrentStaffInput
      return this.settingsService.updateSettings(user, input)
    }

    throw new ForbiddenException(this.ts.translateError('forbidden'))
  }
}
