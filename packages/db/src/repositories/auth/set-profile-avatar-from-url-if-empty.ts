import { and, eq, isNull } from 'drizzle-orm'
import { USER_ROLE, type UserRole } from '@repo/types'
import { db, type Transaction } from '../../client.ts'
import { ownerAccountsLnk } from '../../schema/owner-account-lnk.ts'
import { owners } from '../../schema/owner.ts'
import { userAccountsLnk } from '../../schema/user-account-lnk.ts'
import { users } from '../../schema/user.ts'
import { createExternalImageAsset } from '../assets/create-external-image-asset.ts'

export const GOOGLE_AVATAR_ASSET_NAME = 'google-avatar' as const

export async function setProfileAvatarFromUrlIfEmpty(input: {
  accountId: number
  roleName: UserRole
  pictureUrl: string
}): Promise<boolean> {
  const pictureUrl = input.pictureUrl.trim()
  if (!pictureUrl) {
    return false
  }

  if (input.roleName === USER_ROLE.USER) {
    return setUserAvatarIfEmpty(input.accountId, pictureUrl)
  }

  if (input.roleName === USER_ROLE.OWNER) {
    return setOwnerAvatarIfEmpty(input.accountId, pictureUrl)
  }

  return false
}

async function setUserAvatarIfEmpty(accountId: number, pictureUrl: string): Promise<boolean> {
  const [row] = await db
    .select({ id: users.id, avatarId: users.avatarId })
    .from(userAccountsLnk)
    .innerJoin(users, eq(users.id, userAccountsLnk.userId))
    .where(eq(userAccountsLnk.accountId, accountId))
    .limit(1)

  if (!row || row.avatarId !== null) {
    return false
  }

  return db.transaction(async (tx: Transaction) => {
    const asset = await createExternalImageAsset(tx, {
      url: pictureUrl,
      name: GOOGLE_AVATAR_ASSET_NAME,
    })

    const updated = await tx
      .update(users)
      .set({ avatarId: asset.id })
      .where(and(eq(users.id, row.id), isNull(users.avatarId)))
      .returning({ id: users.id })

    return updated.length > 0
  })
}

async function setOwnerAvatarIfEmpty(accountId: number, pictureUrl: string): Promise<boolean> {
  const [row] = await db
    .select({ id: owners.id, avatarId: owners.avatarId })
    .from(ownerAccountsLnk)
    .innerJoin(owners, eq(owners.id, ownerAccountsLnk.ownerId))
    .where(eq(ownerAccountsLnk.accountId, accountId))
    .limit(1)

  if (!row || row.avatarId !== null) {
    return false
  }

  return db.transaction(async (tx: Transaction) => {
    const asset = await createExternalImageAsset(tx, {
      url: pictureUrl,
      name: GOOGLE_AVATAR_ASSET_NAME,
    })

    const updated = await tx
      .update(owners)
      .set({ avatarId: asset.id })
      .where(and(eq(owners.id, row.id), isNull(owners.avatarId)))
      .returning({ id: owners.id })

    return updated.length > 0
  })
}
