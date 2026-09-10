import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { replaceOwnerAvatar, replaceUserAvatar } from '@repo/db'
import { FILE_ERROR_CODE } from '@repo/i18n/constants'
import { TranslationService } from '@repo/i18n/server'
import { ASSET_TYPE, USER_ROLE, type AvatarMutationResponse, type JwtPayload } from '@repo/types'
import { AVATAR_UPLOAD_MAX_BYTES, isAllowedImageMimeType } from '@repo/validators'
import { FilesService } from '../../files/application/services/files.service'

@Injectable()
export class UploadAvatarUseCase {
  constructor(
    @Inject(FilesService) private readonly filesService: FilesService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(
    user: JwtPayload,
    file: Express.Multer.File | undefined
  ): Promise<AvatarMutationResponse> {
    this.assertSupportedRole(user)
    this.validateFile(file)

    const key = this.filesService.buildAvatarKey(user.sub)
    const uploaded = await this.filesService.uploadAvatarWithKey(file, key)
    const assetInput = {
      name: file.originalname,
      url: uploaded.url,
      storageKey: uploaded.key,
      type: ASSET_TYPE.IMG,
    } as const

    let result: Awaited<ReturnType<typeof replaceUserAvatar>>

    try {
      result =
        user.role === USER_ROLE.OWNER
          ? await replaceOwnerAvatar(user.sub, assetInput)
          : await replaceUserAvatar(user.sub, assetInput)
    } catch (error) {
      try {
        await this.filesService.deleteImages([uploaded.key])
      } catch {
        // Best-effort rollback of the orphaned upload.
      }
      throw error
    }

    if (result.previousAvatar?.storageKey) {
      try {
        await this.filesService.deleteImages([result.previousAvatar.storageKey])
      } catch {
        // The profile already references the new asset; remote cleanup is best-effort.
      }
    }

    return { avatar: result.avatar.url ?? null }
  }

  private assertSupportedRole(user: JwtPayload): void {
    if (user.role !== USER_ROLE.USER && user.role !== USER_ROLE.OWNER) {
      throw new ForbiddenException(this.ts.translateError('forbidden'))
    }
  }

  private validateFile(file: Express.Multer.File | undefined): asserts file is Express.Multer.File {
    if (!file) {
      throw new BadRequestException(this.ts.translateError(FILE_ERROR_CODE.FILE_REQUIRED))
    }

    if (!isAllowedImageMimeType(file.mimetype)) {
      throw new BadRequestException(this.ts.translateError(FILE_ERROR_CODE.INVALID_IMAGE_TYPE))
    }

    if (file.size > AVATAR_UPLOAD_MAX_BYTES) {
      throw new BadRequestException(this.ts.translateError(FILE_ERROR_CODE.FILE_TOO_LARGE))
    }
  }
}
