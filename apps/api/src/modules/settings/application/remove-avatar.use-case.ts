import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { clearOwnerAvatar, clearUserAvatar } from '@repo/db'
import { TranslationService } from '@repo/i18n/server'
import { USER_ROLE, type AvatarMutationResponse, type JwtPayload } from '@repo/types'
import { FilesService } from '../../files/application/services/files.service'

@Injectable()
export class RemoveAvatarUseCase {
  constructor(
    @Inject(FilesService) private readonly filesService: FilesService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(user: JwtPayload): Promise<AvatarMutationResponse> {
    if (user.role !== USER_ROLE.USER && user.role !== USER_ROLE.OWNER) {
      throw new ForbiddenException(this.ts.translateError('forbidden'))
    }

    const previousAvatar =
      user.role === USER_ROLE.OWNER
        ? await clearOwnerAvatar(user.sub)
        : await clearUserAvatar(user.sub)

    if (previousAvatar?.storageKey) {
      try {
        await this.filesService.deleteImages([previousAvatar.storageKey])
      } catch {
        // The profile is already cleared; remote cleanup is best-effort.
      }
    }

    return { avatar: null }
  }
}
