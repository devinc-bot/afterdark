import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import {
  accountExistsByEmail,
  createStaffInvitation as insertStaffInvitation,
  findClubByDocumentId,
  findInviterOwnerWithRole,
} from '@afterdark/db'
import type { ClubSelect, StaffInvitationSelect } from '@afterdark/db'
import {
  STAFF_INVITATION_STATUS,
  USER_ROLE,
  type CreateStaffInvitationResponse,
} from '@afterdark/types'
import type { CreateStaffInvitationInput } from '@afterdark/validators'
import { ENV } from '../common/config/env'
import { INVITATION_MESSAGE } from './invitations.constants'
import {
  buildStaffInvitationPayload,
  buildStaffInvitationUrl,
} from './utils/staff-invitation.utils'

function toStaffInvitationResponse(
  invitation: StaffInvitationSelect,
  club: ClubSelect,
  invitedByOwnerDocumentId: string
): CreateStaffInvitationResponse {
  return {
    documentId: invitation.documentId,
    email: invitation.email,
    clubId: club.documentId,
    clubName: club.name,
    invitedByOwnerId: invitedByOwnerDocumentId,
    slug: invitation.slug,
    url: buildStaffInvitationUrl(ENV.DASHBOARD_URL, invitation.slug, invitation.token),
    expiresAt: invitation.expiresAt,
    hasSecurityWord: Boolean(invitation.securityWordHash),
    status: invitation.status,
    role: invitation.role,
    createdAt: invitation.createdAt,
    updatedAt: invitation.updatedAt,
  }
}

@Injectable()
export class InvitationsService {
  async createStaffInvitation(
    inviterDocumentId: string,
    input: CreateStaffInvitationInput
  ): Promise<CreateStaffInvitationResponse> {
    const inviter = await findInviterOwnerWithRole(inviterDocumentId)

    if (!inviter) {
      throw new NotFoundException(INVITATION_MESSAGE.INVITER_NOT_FOUND)
    }

    if (inviter.role !== USER_ROLE.OWNER) {
      throw new ForbiddenException(INVITATION_MESSAGE.FORBIDDEN)
    }

    if (await accountExistsByEmail(input.email)) {
      throw new ConflictException(INVITATION_MESSAGE.EMAIL_ALREADY_REGISTERED)
    }

    const club = await findClubByDocumentId(input.clubId)

    if (!club) {
      throw new NotFoundException(INVITATION_MESSAGE.CLUB_NOT_FOUND)
    }

    const { slug, token, expiresAt, securityWordHash } = buildStaffInvitationPayload({
      email: input.email,
      clubDocumentId: club.documentId,
      securityWord: input.securityWord,
    })

    try {
      const invitation = await insertStaffInvitation({
        email: input.email,
        clubId: club.id,
        invitedByOwnerId: inviter.id,
        slug,
        token,
        securityWordHash: securityWordHash ?? null,
        expiresAt,
        status: STAFF_INVITATION_STATUS.PENDING,
        role: USER_ROLE.STAFF,
      })

      return toStaffInvitationResponse(invitation, club, inviter.documentId)
    } catch {
      throw new InternalServerErrorException(INVITATION_MESSAGE.CREATE_FAILED)
    }
  }
}
