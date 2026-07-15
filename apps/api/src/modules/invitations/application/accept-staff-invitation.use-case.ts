import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import {
  accountExistsByEmail,
  deleteStaffInvitationById,
  findRoleByName,
  findStaffInvitationByTokenWithClub,
  registerStaffForClub,
} from '@afterdark/db'
import { TranslationService } from '@afterdark/i18n/server'
import { STAFF_INVITATION_STATUS, USER_ROLE } from '@afterdark/types'
import type { AcceptStaffInvitationApiInput } from '@afterdark/validators'
import { JwtService } from '@nestjs/jwt'
import { hashValue, verifyValue } from '../../common'
import type { StaffInvitationPayload } from '../utils/staff-invitation.utils'

@Injectable()
export class AcceptStaffInvitationUseCase {
  private readonly logger = new Logger(AcceptStaffInvitationUseCase.name)

  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(
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
      await registerStaffForClub({
        email: row.invitation.email,
        hashedPassword,
        roleId: staffRole.id,
        roleName: USER_ROLE.STAFF,
        profile: { name: input.name, lastName: input.lastName, phone: input.phone },
        clubId: row.invitation.clubId,
      })
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('invitation.ACCEPT_FAILED'))
    }

    try {
      await deleteStaffInvitationById(row.invitation.id)
    } catch (error) {
      this.logger.error('Failed to delete invitation after accept', error)
    }

    return { message: this.ts.translateError('invitation.ACCEPT_SUCCESS') }
  }
}
