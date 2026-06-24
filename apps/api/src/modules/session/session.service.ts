import { Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import {
  accounts,
  db,
  ownerAccountsLnk,
  owners,
  staff,
  staffAccountsLnk,
  userAccountsLnk,
  users,
} from '@afterdark/db'
import { USER_ROLE, type JwtPayload, type SessionResponse } from '@afterdark/types'
import { SESSION_MESSAGE } from './session.constants'

type ProfileRow = {
  documentId: string
  name: string
  lastName: string
  avatar: string | null
  email: string
}

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

  private findProfileByRole(payload: JwtPayload): Promise<ProfileRow | null> {
    if (payload.role === USER_ROLE.OWNER) {
      return this.findOwnerProfile(payload.sub)
    }

    if (payload.role === USER_ROLE.STAFF) {
      return this.findStaffProfile(payload.sub)
    }

    if (payload.role === USER_ROLE.USER) {
      return this.findUserProfile(payload.sub)
    }

    if (payload.role === USER_ROLE.ADMIN) {
      return this.findAdminProfile(payload)
    }

    return Promise.resolve(null)
  }

  private async findOwnerProfile(documentId: string): Promise<ProfileRow | null> {
    const [row] = await db
      .select({
        documentId: owners.documentId,
        name: owners.name,
        lastName: owners.lastName,
        avatar: owners.avatar,
        email: accounts.email,
      })
      .from(owners)
      .innerJoin(ownerAccountsLnk, eq(ownerAccountsLnk.ownerId, owners.id))
      .innerJoin(accounts, eq(accounts.id, ownerAccountsLnk.accountId))
      .where(eq(owners.documentId, documentId))
      .limit(1)

    return row ?? null
  }

  private async findStaffProfile(documentId: string): Promise<ProfileRow | null> {
    const [row] = await db
      .select({
        documentId: staff.documentId,
        name: staff.name,
        lastName: staff.lastName,
        avatar: staff.avatar,
        email: accounts.email,
      })
      .from(staff)
      .innerJoin(staffAccountsLnk, eq(staffAccountsLnk.staffId, staff.id))
      .innerJoin(accounts, eq(accounts.id, staffAccountsLnk.accountId))
      .where(eq(staff.documentId, documentId))
      .limit(1)

    return row ?? null
  }

  private async findUserProfile(documentId: string): Promise<ProfileRow | null> {
    const [row] = await db
      .select({
        documentId: users.documentId,
        name: users.name,
        lastName: users.lastName,
        avatar: users.avatar,
        email: accounts.email,
      })
      .from(users)
      .innerJoin(userAccountsLnk, eq(userAccountsLnk.userId, users.id))
      .innerJoin(accounts, eq(accounts.id, userAccountsLnk.accountId))
      .where(eq(users.documentId, documentId))
      .limit(1)

    return row ?? null
  }

  private async findAdminProfile(payload: JwtPayload): Promise<ProfileRow | null> {
    const [row] = await db
      .select({
        documentId: accounts.documentId,
        email: accounts.email,
      })
      .from(accounts)
      .where(eq(accounts.email, payload.email))
      .limit(1)

    if (!row) {
      return null
    }

    return {
      documentId: payload.sub,
      name: '',
      lastName: '',
      avatar: null,
      email: row.email,
    }
  }
}
