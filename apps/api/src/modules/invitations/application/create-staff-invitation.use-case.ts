import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import {
  accountExistsByEmail,
  createStaffInvitation as insertStaffInvitation,
  findLocationByDocumentId,
} from '@afterdark/db'
import { TranslationService } from '@afterdark/i18n/server'
import { CreateStaffInvitationResponse, STAFF_INVITATION_STATUS, USER_ROLE } from '@afterdark/types'
import type { CreateStaffInvitationInput } from '@afterdark/validators'
import { JwtService } from '@nestjs/jwt'
import { toStaffInvitationResponse } from '../mappers/invitation.mapper'
import { buildStaffInvitationPayload } from '../utils/staff-invitation.utils'
import { InvitationOwnerService } from './services/invitation-owner.service'

@Injectable()
export class CreateStaffInvitationUseCase {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(TranslationService) private readonly ts: TranslationService,
    @Inject(InvitationOwnerService) private readonly invitationOwnerService: InvitationOwnerService
  ) {}

  async execute(
    inviterDocumentId: string,
    input: CreateStaffInvitationInput
  ): Promise<CreateStaffInvitationResponse> {
    const inviter = await this.invitationOwnerService.requireOwnerInviter(inviterDocumentId)

    if (await accountExistsByEmail(input.email)) {
      throw new ConflictException(this.ts.translateError('auth.EMAIL_ALREADY_REGISTERED'))
    }

    const location = await findLocationByDocumentId(input.locationId)

    if (!location) {
      throw new NotFoundException(this.ts.translateError('invitation.CLUB_NOT_FOUND'))
    }

    const { payload, slug, expiresAt, expiresInSeconds, securityWordHash } =
      await buildStaffInvitationPayload({
        email: input.email,
        locationDocumentId: location.documentId,
        securityWord: input.securityWord,
        expiresInMs: input.expiresInMs,
      })

    const token = await this.jwtService.signAsync(payload, { expiresIn: expiresInSeconds })

    try {
      const invitation = await insertStaffInvitation({
        email: input.email,
        locationId: location.id,
        invitedByOwnerId: inviter.id,
        slug,
        token,
        securityWordHash: securityWordHash ?? null,
        expiresAt,
        status: STAFF_INVITATION_STATUS.PENDING,
        role: USER_ROLE.STAFF,
      })

      return toStaffInvitationResponse(invitation, location, inviter.documentId)
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('invitation.CREATE_FAILED'))
    }
  }
}
