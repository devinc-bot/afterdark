import { Injectable, NotFoundException } from '@nestjs/common'
import {
  findAccountEmailByEmail,
  findOwnerProfileByDocumentId,
  findStaffProfileByDocumentId,
  findUserProfileByDocumentId,
} from '@afterdark/db'
import { USER_ROLE, type JwtPayload, type SessionResponse } from '@afterdark/types'
import { TranslationService } from '@afterdark/i18n/server'

@Injectable()
export class SessionService {
  constructor(private readonly ts: TranslationService) {}

  async getCurrentSession(payload: JwtPayload): Promise<SessionResponse> {
    const row = await this.findProfileByRole(payload)

    if (!row) {
      throw new NotFoundException(this.ts.translateError('auth.SESSION_NOT_FOUND'))
    }

    return {
      sub: row.documentId,
      name: row.name,
      lastName: row.lastName,
      email: row.email,
      avatar: row.avatar,
    }
  }

  private findProfileByRole(payload: JwtPayload) {
    if (payload.role === USER_ROLE.OWNER) {
      return findOwnerProfileByDocumentId(payload.sub)
    }

    if (payload.role === USER_ROLE.STAFF) {
      return findStaffProfileByDocumentId(payload.sub)
    }

    if (payload.role === USER_ROLE.USER) {
      return findUserProfileByDocumentId(payload.sub)
    }

    if (payload.role === USER_ROLE.ADMIN) {
      return this.findAdminProfile(payload)
    }

    return Promise.resolve(null)
  }

  private async findAdminProfile(payload: JwtPayload) {
    const email = await findAccountEmailByEmail(payload.email)

    if (!email) {
      return null
    }

    return {
      documentId: payload.sub,
      name: '',
      lastName: '',
      avatar: null,
      email,
    }
  }
}
