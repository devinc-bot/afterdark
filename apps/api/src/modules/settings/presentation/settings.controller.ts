import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  Patch,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { API_ROUTES } from '@repo/common'
import {
  USER_ROLE,
  type AvatarMutationResponse,
  type JwtPayload,
  type SettingsResponse,
} from '@repo/types'
import {
  AVATAR_MULTIPART_FIELD,
  updateCurrentOwnerSchema,
  updateCurrentStaffSchema,
  updateCurrentUserProfileSchema,
  type UpdateCurrentOwnerInput,
  type UpdateCurrentStaffInput,
  type UpdateCurrentUserProfileInput,
} from '@repo/validators'
import { TranslationService } from '@repo/i18n/server'
import { ApiRateLimit } from '../../common/decorators/api-rate-limit.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RATE_LIMIT_PROFILE } from '../../../config/rate-limit.policy'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { avatarUploadOptions } from '../../files/avatar-upload.options'
import { GetSettingsUseCase } from '../application/get-settings.use-case'
import { RemoveAvatarUseCase } from '../application/remove-avatar.use-case'
import { UpdateSettingsUseCase } from '../application/update-settings.use-case'
import { UploadAvatarUseCase } from '../application/upload-avatar.use-case'

@Controller(API_ROUTES.settings.prefix)
@ApiRateLimit(RATE_LIMIT_PROFILE.AUTHENTICATED)
export class SettingsController {
  constructor(
    @Inject(GetSettingsUseCase) private readonly getSettings: GetSettingsUseCase,
    @Inject(UpdateSettingsUseCase) private readonly updateSettings: UpdateSettingsUseCase,
    @Inject(UploadAvatarUseCase) private readonly uploadAvatar: UploadAvatarUseCase,
    @Inject(RemoveAvatarUseCase) private readonly removeAvatar: RemoveAvatarUseCase,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  @Get(API_ROUTES.settings.path.root())
  @UseGuards(JwtAuthGuard)
  get(@CurrentUser() user: JwtPayload): Promise<SettingsResponse> {
    return this.getSettings.execute(user)
  }

  @Put(API_ROUTES.settings.path.avatar())
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor(AVATAR_MULTIPART_FIELD, avatarUploadOptions))
  uploadProfileAvatar(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File | undefined
  ): Promise<AvatarMutationResponse> {
    return this.uploadAvatar.execute(user, file)
  }

  @Delete(API_ROUTES.settings.path.avatar())
  @UseGuards(JwtAuthGuard)
  removeProfileAvatar(@CurrentUser() user: JwtPayload): Promise<AvatarMutationResponse> {
    return this.removeAvatar.execute(user)
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
