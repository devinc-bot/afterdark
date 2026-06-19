import { Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { accounts, db, userAccountsLnk, users } from '@afterdark/db'
import type { CurrentUserResponse } from '@afterdark/types'
import type { UpdateCurrentUserInput } from '@afterdark/validators'
import { USER_MESSAGE } from './users.constants'

@Injectable()
export class UsersService {
  async getCurrentUser(documentId: string): Promise<CurrentUserResponse> {
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

    if (!row) {
      throw new NotFoundException(USER_MESSAGE.NOT_FOUND)
    }

    return {
      sub: row.documentId,
      name: row.name,
      lastName: row.lastName,
      email: row.email,
      avatar: row.avatar,
    }
  }

  async updateCurrentUser(
    documentId: string,
    input: UpdateCurrentUserInput
  ): Promise<CurrentUserResponse> {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.documentId, documentId))
      .limit(1)

    if (!existing) {
      throw new NotFoundException(USER_MESSAGE.NOT_FOUND)
    }

    await db
      .update(users)
      .set({
        name: input.name,
        lastName: input.lastName,
        updatedAt: new Date(),
      })
      .where(eq(users.documentId, documentId))

    return this.getCurrentUser(documentId)
  }
}
