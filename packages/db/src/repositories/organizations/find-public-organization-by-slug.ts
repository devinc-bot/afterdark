import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { assets } from '../../schema/asset.ts'
import { organizationAccountsLnk } from '../../schema/organization-account-lnk.ts'
import { organizations } from '../../schema/organization.ts'
import { ownerAccountsLnk } from '../../schema/owner-account-lnk.ts'
import { owners } from '../../schema/owner.ts'

export async function findPublicOrganizationBySlug(slug: string) {
  const [row] = await db
    .select({
      id: organizations.id,
      documentId: organizations.documentId,
      slug: organizations.slug,
      name: organizations.name,
      avatar: assets.url,
    })
    .from(organizations)
    .leftJoin(organizationAccountsLnk, eq(organizationAccountsLnk.organizationId, organizations.id))
    .leftJoin(ownerAccountsLnk, eq(ownerAccountsLnk.accountId, organizationAccountsLnk.accountId))
    .leftJoin(owners, eq(owners.id, ownerAccountsLnk.ownerId))
    .leftJoin(assets, eq(assets.id, owners.avatarId))
    .where(eq(organizations.slug, slug))
    .limit(1)

  return row ?? null
}
