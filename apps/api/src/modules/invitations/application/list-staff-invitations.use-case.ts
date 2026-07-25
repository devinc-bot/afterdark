import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { findStaffInvitationsByOwnerDocumentId } from '@repo/db'
import { TranslationService } from '@repo/i18n/server'
import type { CreateStaffInvitationResponse } from '@repo/types'
import { toStaffInvitationResponse } from '../mappers/invitation.mapper'
import { InvitationOwnerService } from './services/invitation-owner.service'

@Injectable()
export class ListStaffInvitationsUseCase {
  constructor(
    @Inject(TranslationService) private readonly ts: TranslationService,
    @Inject(InvitationOwnerService) private readonly invitationOwnerService: InvitationOwnerService
  ) {}

  async execute(inviterDocumentId: string): Promise<CreateStaffInvitationResponse[]> {
    const inviter = await this.invitationOwnerService.requireOwnerInviter(inviterDocumentId)

    try {
      const rows = await findStaffInvitationsByOwnerDocumentId(inviterDocumentId)

      return rows.map(({ invitation, locationDocumentId, locationName }) =>
        toStaffInvitationResponse(
          invitation,
          { documentId: locationDocumentId, name: locationName },
          inviter.documentId
        )
      )
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('invitation.LIST_FAILED'))
    }
  }
}
