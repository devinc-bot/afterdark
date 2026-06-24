import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { eq } from 'drizzle-orm'
import {
  accounts,
  accountRolesLnk,
  clubs,
  db,
  ownerAccountsLnk,
  owners,
  roles,
  staffInvitations,
  type ClubSelect,
  type StaffInvitationSelect,
} from '@afterdark/db'
import {
  STAFF_INVITATION_STATUS,
  USER_ROLE,
  type CreateStaffInvitationResponse,
} from '@afterdark/types'
import type { CreateStaffInvitationInput } from '@afterdark/validators'
import { ENV } from '../../common/config/env'
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
    const [inviter] = await db
      .select({
        id: owners.id,
        documentId: owners.documentId,
        role: roles.name,
      })
      .from(owners)
      .innerJoin(ownerAccountsLnk, eq(ownerAccountsLnk.ownerId, owners.id))
      .innerJoin(accountRolesLnk, eq(accountRolesLnk.accountId, ownerAccountsLnk.accountId))
      .innerJoin(roles, eq(roles.id, accountRolesLnk.roleId))
      .where(eq(owners.documentId, inviterDocumentId))
      .limit(1)

    if (!inviter) {
      throw new NotFoundException(INVITATION_MESSAGE.INVITER_NOT_FOUND)
    }

    if (inviter.role !== USER_ROLE.OWNER) {
      throw new ForbiddenException(INVITATION_MESSAGE.FORBIDDEN)
    }

    const [existingAccount] = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.email, input.email))
      .limit(1)

    if (existingAccount) {
      throw new ConflictException(INVITATION_MESSAGE.EMAIL_ALREADY_REGISTERED)
    }

    const [club] = await db.select().from(clubs).where(eq(clubs.documentId, input.clubId)).limit(1)

    if (!club) {
      throw new NotFoundException(INVITATION_MESSAGE.CLUB_NOT_FOUND)
    }

    const { slug, token, expiresAt, securityWordHash } = buildStaffInvitationPayload({
      email: input.email,
      clubDocumentId: club.documentId,
      securityWord: input.securityWord,
    })

    const [invitation] = await db
      .insert(staffInvitations)
      .values({
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
      .returning()

    if (!invitation) {
      throw new InternalServerErrorException(INVITATION_MESSAGE.CREATE_FAILED)
    }

    return toStaffInvitationResponse(invitation, club, inviter.documentId)
  }
}
