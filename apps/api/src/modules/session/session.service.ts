import { Injectable, NotFoundException } from '@nestjs/common'
import {
  findAccountEmailByEmail,
  findOwnerProfileByDocumentId,
  findStaffProfileByDocumentId,
  findUserProfileByDocumentId,
} from '@afterdark/db'
import { USER_ROLE, type JwtPayload, type SessionResponse } from '@afterdark/types'
import { SESSION_MESSAGE } from './session.constants'

@Injectable()
export class SessionService {
  async getCurrentSession(payload: JwtPayload): Promise<SessionResponse> {
    const row = await this.findProfileByRole(payload)

    if (!row) {
      throw new NotFoundException(SESSION_MESSAGE.NOT_FOUND)
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
