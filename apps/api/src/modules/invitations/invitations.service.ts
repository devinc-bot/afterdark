import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import {
  accountExistsByEmail,
  createStaffInvitation as insertStaffInvitation,
  findClubByDocumentId,
  findInviterOwnerWithRole,
  deleteStaffInvitationById,
  findStaffInvitationByDocumentIdForOwner,
  findStaffInvitationByTokenWithClub,
  findStaffInvitationsByOwnerDocumentId,
} from '@afterdark/db'
import type { ClubSelect, StaffInvitationSelect } from '@afterdark/db'
import {
  STAFF_INVITATION_STATUS,
  USER_ROLE,
  type CreateStaffInvitationResponse,
  type StaffInvitationPublicResponse,
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
  club: Pick<ClubSelect, 'documentId' | 'name'>,
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

  async listStaffInvitations(inviterDocumentId: string): Promise<CreateStaffInvitationResponse[]> {
    const inviter = await findInviterOwnerWithRole(inviterDocumentId)

    if (!inviter) {
      throw new NotFoundException(INVITATION_MESSAGE.INVITER_NOT_FOUND)
    }

    if (inviter.role !== USER_ROLE.OWNER) {
      throw new ForbiddenException(INVITATION_MESSAGE.FORBIDDEN)
    }

    try {
      const rows = await findStaffInvitationsByOwnerDocumentId(inviterDocumentId)

      return rows.map(({ invitation, clubDocumentId, clubName }) =>
        toStaffInvitationResponse(
          invitation,
          { documentId: clubDocumentId, name: clubName },
          inviter.documentId
        )
      )
    } catch {
      throw new InternalServerErrorException(INVITATION_MESSAGE.LIST_FAILED)
    }
  }

  async deleteStaffInvitation(
    inviterDocumentId: string,
    invitationDocumentId: string
  ): Promise<void> {
    const inviter = await findInviterOwnerWithRole(inviterDocumentId)

    if (!inviter) {
      throw new NotFoundException(INVITATION_MESSAGE.INVITER_NOT_FOUND)
    }

    if (inviter.role !== USER_ROLE.OWNER) {
      throw new ForbiddenException(INVITATION_MESSAGE.FORBIDDEN)
    }

    const invitation = await findStaffInvitationByDocumentIdForOwner(
      invitationDocumentId,
      inviterDocumentId
    )

    if (!invitation) {
      throw new NotFoundException(INVITATION_MESSAGE.NOT_FOUND)
    }

    if (invitation.status === STAFF_INVITATION_STATUS.ACCEPTED) {
      throw new ConflictException(INVITATION_MESSAGE.DELETE_ACCEPTED)
    }

    try {
      await deleteStaffInvitationById(invitation.id)
    } catch {
      throw new InternalServerErrorException(INVITATION_MESSAGE.DELETE_FAILED)
    }
  }

  async getStaffInvitationByLink(
    slug: string,
    token: string
  ): Promise<StaffInvitationPublicResponse> {
    try {
      const row = await findStaffInvitationByTokenWithClub(token)

      if (!row) {
        throw new NotFoundException(INVITATION_MESSAGE.PUBLIC_INVALID)
      }

      if (row.invitation.slug !== slug) {
        throw new BadRequestException(INVITATION_MESSAGE.PUBLIC_SLUG_MISMATCH)
      }

      if (row.invitation.status === STAFF_INVITATION_STATUS.ACCEPTED) {
        throw new ConflictException(INVITATION_MESSAGE.PUBLIC_ALREADY_ACCEPTED)
      }

      if (
        row.invitation.status === STAFF_INVITATION_STATUS.CANCELLED ||
        row.invitation.status === STAFF_INVITATION_STATUS.EXPIRED
      ) {
        throw new GoneException(INVITATION_MESSAGE.PUBLIC_EXPIRED)
      }

      if (row.invitation.expiresAt.getTime() <= Date.now()) {
        throw new GoneException(INVITATION_MESSAGE.PUBLIC_EXPIRED)
      }

      if (row.invitation.status !== STAFF_INVITATION_STATUS.PENDING) {
        throw new NotFoundException(INVITATION_MESSAGE.PUBLIC_INVALID)
      }

      return {
        documentId: row.invitation.documentId,
        email: row.invitation.email,
        clubId: row.clubDocumentId,
        clubName: row.clubName,
        slug: row.invitation.slug,
        expiresAt: row.invitation.expiresAt,
        hasSecurityWord: Boolean(row.invitation.securityWordHash),
        securityWordHash: row.invitation.securityWordHash,
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof GoneException ||
        error instanceof ConflictException
      ) {
        throw error
      }

      throw new InternalServerErrorException(INVITATION_MESSAGE.PUBLIC_GET_FAILED)
    }
  }
}
