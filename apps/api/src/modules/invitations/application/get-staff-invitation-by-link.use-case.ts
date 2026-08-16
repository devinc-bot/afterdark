import {
  BadRequestException,
  ConflictException,
  GoneException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { findStaffInvitationByTokenWithOrganization } from '@repo/db'
import { TranslationService } from '@repo/i18n/server'
import { STAFF_INVITATION_STATUS, type StaffInvitationPublicResponse } from '@repo/types'
import { JwtService } from '@nestjs/jwt'
import type { StaffInvitationPayload } from '../utils/staff-invitation.utils'

@Injectable()
export class GetStaffInvitationByLinkUseCase {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(slug: string, token: string): Promise<StaffInvitationPublicResponse> {
    try {
      await this.jwtService.verifyAsync<StaffInvitationPayload>(token)
    } catch {
      throw new NotFoundException(this.ts.translateError('invitation.PUBLIC_INVALID'))
    }

    try {
      const row = await findStaffInvitationByTokenWithOrganization(token)

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
        organizationId: row.organizationDocumentId,
        organizationName: row.organizationName,
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
