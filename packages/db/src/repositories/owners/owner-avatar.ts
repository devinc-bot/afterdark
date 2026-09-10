import { eq } from 'drizzle-orm'
import { db, type Transaction } from '../../client.ts'
import { assets, type AssetInsert, type AssetSelect } from '../../schema/asset.ts'
import { owners } from '../../schema/owner.ts'

export type OwnerAvatarAssetInput = Pick<AssetInsert, 'name' | 'url' | 'storageKey' | 'type'>

export async function replaceOwnerAvatar(
  documentId: string,
  assetInput: OwnerAvatarAssetInput
): Promise<{ avatar: AssetSelect; previousAvatar: AssetSelect | null }> {
  return db.transaction(async (tx: Transaction) => {
    const [profile] = await tx
      .select({ id: owners.id, avatarId: owners.avatarId })
      .from(owners)
      .where(eq(owners.documentId, documentId))
      .for('update')

    if (!profile) {
      throw new Error('Owner not found while replacing avatar')
    }

    const previousAvatar = await findAssetById(tx, profile.avatarId)
    const [avatar] = await tx.insert(assets).values(assetInput).returning()

    if (!avatar) {
      throw new Error('Avatar asset insert returned no row')
    }

    await tx
      .update(owners)
      .set({ avatarId: avatar.id, updatedAt: new Date() })
      .where(eq(owners.id, profile.id))

    if (previousAvatar) {
      await tx.delete(assets).where(eq(assets.id, previousAvatar.id))
    }

    return { avatar, previousAvatar }
  })
}

export async function clearOwnerAvatar(documentId: string): Promise<AssetSelect | null> {
  return db.transaction(async (tx: Transaction) => {
    const [profile] = await tx
      .select({ id: owners.id, avatarId: owners.avatarId })
      .from(owners)
      .where(eq(owners.documentId, documentId))
      .for('update')

    if (!profile) {
      throw new Error('Owner not found while clearing avatar')
    }

    const previousAvatar = await findAssetById(tx, profile.avatarId)

    await tx
      .update(owners)
      .set({ avatarId: null, updatedAt: new Date() })
      .where(eq(owners.id, profile.id))

    if (previousAvatar) {
      await tx.delete(assets).where(eq(assets.id, previousAvatar.id))
    }

    return previousAvatar
  })
}

async function findAssetById(tx: Transaction, assetId: number | null): Promise<AssetSelect | null> {
  if (assetId === null) {
    return null
  }

  const [asset] = await tx.select().from(assets).where(eq(assets.id, assetId)).limit(1)
  return asset ?? null
}
