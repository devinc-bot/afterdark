import { Body, Controller, ForbiddenException, Get, Inject, Patch, UseGuards } from '@nestjs/common'
import { API_ROUTES } from '@repo/common'
import { USER_ROLE, type JwtPayload, type SettingsResponse } from '@repo/types'
import {
  updateCurrentOwnerSchema,
  updateCurrentStaffSchema,
  updateCurrentUserProfileSchema,
  type UpdateCurrentOwnerInput,
  type UpdateCurrentStaffInput,
  type UpdateCurrentUserProfileInput,
} from '@repo/validators'
import { TranslationService } from '@repo/i18n/server'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { GetSettingsUseCase } from '../application/get-settings.use-case'
import { UpdateSettingsUseCase } from '../application/update-settings.use-case'

@Controller(API_ROUTES.settings.prefix)
export class SettingsController {
  constructor(
    @Inject(GetSettingsUseCase) private readonly getSettings: GetSettingsUseCase,
    @Inject(UpdateSettingsUseCase) private readonly updateSettings: UpdateSettingsUseCase,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  @Get(API_ROUTES.settings.path.root())
  @UseGuards(JwtAuthGuard)
  get(@CurrentUser() user: JwtPayload): Promise<SettingsResponse> {
    return this.getSettings.execute(user)
  }

  @Patch(API_ROUTES.settings.path.root())
  @UseGuards(JwtAuthGuard)
  update(@CurrentUser() user: JwtPayload, @Body() body: unknown): Promise<SettingsResponse> {
    if (user.role === USER_ROLE.OWNER) {
      const input = new ZodValidationPipe(updateCurrentOwnerSchema).transform(
        body
      ) as UpdateCurrentOwnerInput
      return this.updateSettings.execute(user, input)
    }

    if (user.role === USER_ROLE.STAFF) {
      const input = new ZodValidationPipe(updateCurrentStaffSchema).transform(
        body
      ) as UpdateCurrentStaffInput
      return this.updateSettings.execute(user, input)
    }

    if (user.role === USER_ROLE.USER) {
      const input = new ZodValidationPipe(updateCurrentUserProfileSchema).transform(
        body
      ) as UpdateCurrentUserProfileInput
      return this.updateSettings.execute(user, input)
    }

    throw new ForbiddenException(this.ts.translateError('forbidden'))
  }
}
