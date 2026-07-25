import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { findInviterOwnerWithRole } from '@repo/db'
import { TranslationService } from '@repo/i18n/server'
import { USER_ROLE } from '@repo/types'

@Injectable()
export class InvitationOwnerService {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async requireOwnerInviter(documentId: string) {
    const inviter = await findInviterOwnerWithRole(documentId)

    if (!inviter) {
      throw new NotFoundException(this.ts.translateError('invitation.INVITER_NOT_FOUND'))
    }

    if (inviter.role !== USER_ROLE.OWNER) {
      throw new ForbiddenException(this.ts.translateError('invitation.FORBIDDEN'))
    }

    return inviter
  }
}
