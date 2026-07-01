import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { hashValue, verifyValue } from '../common'
import {
  accountExistsByEmail,
  createStaffInvitation as insertStaffInvitation,
  findClubByDocumentId,
  findInviterOwnerWithRole,
  deleteStaffInvitationById,
  findRoleByName,
  findStaffInvitationByDocumentIdForOwner,
  findStaffInvitationByTokenWithClub,
  findStaffInvitationsByOwnerDocumentId,
  registerAccount,
  updateStaffInvitationAccepted,
} from '@afterdark/db'
import {
  CreateStaffInvitationResponse,
  STAFF_INVITATION_STATUS,
  USER_ROLE,
  type StaffInvitationPublicResponse,
} from '@afterdark/types'
import type {
  AcceptStaffInvitationApiInput,
  CreateStaffInvitationInput,
} from '@afterdark/validators'
import { Inject } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { TranslationService } from '@afterdark/i18n/server'
import {
  buildStaffInvitationPayload,
  type StaffInvitationPayload,
} from './utils/staff-invitation.utils'
import { toStaffInvitationResponse } from './invitation.formatter'

@Injectable()
export class InvitationsService {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async createStaffInvitation(
    inviterDocumentId: string,
    input: CreateStaffInvitationInput
  ): Promise<CreateStaffInvitationResponse> {
    const inviter = await findInviterOwnerWithRole(inviterDocumentId)

    if (!inviter) {
      throw new NotFoundException(this.ts.translateError('invitation.INVITER_NOT_FOUND'))
    }

    if (inviter.role !== USER_ROLE.OWNER) {
      throw new ForbiddenException(this.ts.translateError('invitation.FORBIDDEN'))
    }

    if (await accountExistsByEmail(input.email)) {
      throw new ConflictException(this.ts.translateError('auth.EMAIL_ALREADY_REGISTERED'))
    }

    const club = await findClubByDocumentId(input.clubId)

    if (!club) {
      throw new NotFoundException(this.ts.translateError('invitation.CLUB_NOT_FOUND'))
    }

    const { payload, slug, expiresAt, expiresInSeconds, securityWordHash } =
      await buildStaffInvitationPayload({
        email: input.email,
        clubDocumentId: club.documentId,
        securityWord: input.securityWord,
        expiresInMs: input.expiresInMs,
      })

    const token = await this.jwtService.signAsync(payload, { expiresIn: expiresInSeconds })

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
      throw new InternalServerErrorException(this.ts.translateError('invitation.CREATE_FAILED'))
    }
  }

  async listStaffInvitations(inviterDocumentId: string): Promise<CreateStaffInvitationResponse[]> {
    const inviter = await findInviterOwnerWithRole(inviterDocumentId)

    if (!inviter) {
      throw new NotFoundException(this.ts.translateError('invitation.INVITER_NOT_FOUND'))
    }

    if (inviter.role !== USER_ROLE.OWNER) {
      throw new ForbiddenException(this.ts.translateError('invitation.FORBIDDEN'))
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
      throw new InternalServerErrorException(this.ts.translateError('invitation.LIST_FAILED'))
    }
  }

  async deleteStaffInvitation(
    inviterDocumentId: string,
    invitationDocumentId: string
  ): Promise<void> {
    const inviter = await findInviterOwnerWithRole(inviterDocumentId)

    if (!inviter) {
      throw new NotFoundException(this.ts.translateError('invitation.INVITER_NOT_FOUND'))
    }

    if (inviter.role !== USER_ROLE.OWNER) {
      throw new ForbiddenException(this.ts.translateError('invitation.FORBIDDEN'))
    }

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

  async acceptStaffInvitation(
    slug: string,
    token: string,
    input: AcceptStaffInvitationApiInput
  ): Promise<{ message: string }> {
    try {
      await this.jwtService.verifyAsync<StaffInvitationPayload>(token)
    } catch {
      throw new NotFoundException(this.ts.translateError('invitation.PUBLIC_INVALID'))
    }

    const row = await findStaffInvitationByTokenWithClub(token)

    if (!row) {
      throw new NotFoundException(this.ts.translateError('invitation.PUBLIC_INVALID'))
    }

    if (row.invitation.slug !== slug) {
      throw new BadRequestException(this.ts.translateError('invitation.PUBLIC_SLUG_MISMATCH'))
    }

    if (row.invitation.status === STAFF_INVITATION_STATUS.ACCEPTED) {
      throw new ConflictException(this.ts.translateError('invitation.PUBLIC_ALREADY_ACCEPTED'))
    }

    if (
      row.invitation.status === STAFF_INVITATION_STATUS.CANCELLED ||
      row.invitation.status === STAFF_INVITATION_STATUS.EXPIRED
    ) {
      throw new GoneException(this.ts.translateError('invitation.PUBLIC_EXPIRED'))
    }

    if (row.invitation.expiresAt.getTime() <= Date.now()) {
      throw new GoneException(this.ts.translateError('invitation.PUBLIC_EXPIRED'))
    }

    if (row.invitation.status !== STAFF_INVITATION_STATUS.PENDING) {
      throw new NotFoundException(this.ts.translateError('invitation.PUBLIC_INVALID'))
    }

    if (await accountExistsByEmail(row.invitation.email)) {
      throw new ConflictException(this.ts.translateError('auth.EMAIL_ALREADY_REGISTERED'))
    }

    if (row.invitation.securityWordHash) {
      const isValid = await verifyValue(input.securityWord ?? '', row.invitation.securityWordHash)
      if (!isValid) {
        throw new ForbiddenException(this.ts.translateError('invitation.SECURITY_WORD_INVALID'))
      }
    }

    const staffRole = await findRoleByName(USER_ROLE.STAFF)

    if (!staffRole) {
      throw new InternalServerErrorException(this.ts.translateError('invitation.ACCEPT_FAILED'))
    }

    const hashedPassword = await hashValue(input.password)

    try {
      await registerAccount({
        email: row.invitation.email,
        hashedPassword,
        roleId: staffRole.id,
        roleName: USER_ROLE.STAFF,
        profile: { name: input.name, lastName: input.lastName, phone: input.phone },
      })

      await updateStaffInvitationAccepted(row.invitation.id)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('invitation.ACCEPT_FAILED'))
    }

    return { message: this.ts.translateError('invitation.ACCEPT_SUCCESS') }
  }

  async getStaffInvitationByLink(
    slug: string,
    token: string
  ): Promise<StaffInvitationPublicResponse> {
    try {
      await this.jwtService.verifyAsync<StaffInvitationPayload>(token)
    } catch {
      throw new NotFoundException(this.ts.translateError('invitation.PUBLIC_INVALID'))
    }

    try {
      const row = await findStaffInvitationByTokenWithClub(token)

      if (!row) {
        throw new NotFoundException(this.ts.translateError('invitation.PUBLIC_INVALID'))
      }

      if (row.invitation.slug !== slug) {
        throw new BadRequestException(this.ts.translateError('invitation.PUBLIC_SLUG_MISMATCH'))
      }

      if (row.invitation.status === STAFF_INVITATION_STATUS.ACCEPTED) {
        throw new ConflictException(this.ts.translateError('invitation.PUBLIC_ALREADY_ACCEPTED'))
      }

      if (
        row.invitation.status === STAFF_INVITATION_STATUS.CANCELLED ||
        row.invitation.status === STAFF_INVITATION_STATUS.EXPIRED
      ) {
        throw new GoneException(this.ts.translateError('invitation.PUBLIC_EXPIRED'))
      }

      if (row.invitation.expiresAt.getTime() <= Date.now()) {
        throw new GoneException(this.ts.translateError('invitation.PUBLIC_EXPIRED'))
      }

      if (row.invitation.status !== STAFF_INVITATION_STATUS.PENDING) {
        throw new NotFoundException(this.ts.translateError('invitation.PUBLIC_INVALID'))
      }

      return {
        documentId: row.invitation.documentId,
        email: row.invitation.email,
        clubId: row.clubDocumentId,
        clubName: row.clubName,
        slug: row.invitation.slug,
        expiresAt: row.invitation.expiresAt,
        hasSecurityWord: Boolean(row.invitation.securityWordHash),
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

      throw new InternalServerErrorException(this.ts.translateError('invitation.PUBLIC_GET_FAILED'))
    }
  }
}
