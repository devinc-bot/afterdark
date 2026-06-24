import { eq } from 'drizzle-orm'
import { db, type Transaction } from '../client.ts'
import { accounts } from '../schema/account.ts'
import { staff } from '../schema/staff.ts'
import { staffAccountsLnk } from '../schema/staff-account-lnk.ts'

export type StaffProfileRow = {
  documentId: string
  name: string
  lastName: string
  avatar: string | null
  email: string
}

export type StaffProfileSeed = {
  name: string
  lastName: string
  phone: string
}

export async function findStaffDocumentIdByAccountId(accountId: number): Promise<string | null> {
  const [row] = await db
    .select({ documentId: staff.documentId })
    .from(staffAccountsLnk)
    .innerJoin(staff, eq(staff.id, staffAccountsLnk.staffId))
    .where(eq(staffAccountsLnk.accountId, accountId))
    .limit(1)

  return row?.documentId ?? null
}

export async function findStaffProfileByDocumentId(
  documentId: string
): Promise<StaffProfileRow | null> {
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

export async function createStaffWithAccountLink(
  tx: Transaction,
  accountId: number,
  profile: StaffProfileSeed
): Promise<string> {
  const [staffMember] = await tx.insert(staff).values(profile).returning()

  if (!staffMember) {
    throw new Error('Staff insert returned no row')
  }

  await tx.insert(staffAccountsLnk).values({
    staffId: staffMember.id,
    accountId,
  })

  return staffMember.documentId
}
