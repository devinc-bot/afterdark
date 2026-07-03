import { Body, Controller, Get, Inject, Patch, UseGuards } from '@nestjs/common'
import type { JwtPayload, SettingsResponse } from '@afterdark/types'
import { updateCurrentOwnerSchema, type UpdateCurrentOwnerInput } from '@afterdark/validators'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { SettingsService } from './settings.service'

@Controller('settings')
export class SettingsController {
  constructor(@Inject(SettingsService) private readonly settingsService: SettingsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getSettings(@CurrentUser() user: JwtPayload): Promise<SettingsResponse> {
    return this.settingsService.getSettings(user)
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  updateSettings(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(updateCurrentOwnerSchema)) body: UpdateCurrentOwnerInput
  ): Promise<SettingsResponse> {
    return this.settingsService.updateSettings(user, body)
  }
}
