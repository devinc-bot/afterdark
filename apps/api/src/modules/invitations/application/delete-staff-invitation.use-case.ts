import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { deleteStaffInvitationById, findStaffInvitationByDocumentIdForOwner } from '@afterdark/db'
import { TranslationService } from '@afterdark/i18n/server'
import { STAFF_INVITATION_STATUS } from '@afterdark/types'
import { InvitationOwnerService } from './services/invitation-owner.service'

@Injectable()
export class DeleteStaffInvitationUseCase {
  constructor(
    @Inject(TranslationService) private readonly ts: TranslationService,
    @Inject(InvitationOwnerService) private readonly invitationOwnerService: InvitationOwnerService
  ) {}

  async execute(inviterDocumentId: string, invitationDocumentId: string): Promise<void> {
    await this.invitationOwnerService.requireOwnerInviter(inviterDocumentId)

    const invitation = await findStaffInvitationByDocumentIdForOwner(
      invitationDocumentId,
      inviterDocumentId
    )

    if (!invitation) {
      throw new NotFoundException(this.ts.translateError('invitation.NOT_FOUND'))
    }

    if (invitation.status === STAFF_INVITATION_STATUS.ACCEPTED) {
      throw new ConflictException(this.ts.translateError('invitation.DELETE_ACCEPTED'))
    }

    try {
      await deleteStaffInvitationById(invitation.id)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('invitation.DELETE_FAILED'))
    }
  }
}
