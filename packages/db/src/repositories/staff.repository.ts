import { and, desc, eq } from 'drizzle-orm'
import { type StaffStatus, type UserRole, USER_ROLE } from '@afterdark/types'
import { db, type Transaction } from '../client.ts'
import { accounts } from '../schema/account.ts'
import { clubs } from '../schema/club.ts'
import { owners } from '../schema/owner.ts'
import { staff } from '../schema/staff.ts'
import { staffAccountsLnk } from '../schema/staff-account-lnk.ts'
import { staffClubsLnk } from '../schema/staff-club-lnk.ts'

export type StaffProfileRow = {
  documentId: string
  name: string
  lastName: string
  avatar: string | null
  email: string
}

export type CurrentStaffRow = {
  documentId: string
  name: string
  lastName: string
  avatar: string | null
  phone: string
  status: StaffStatus
  email: string
}

export type StaffProfileUpdateInput = {
  name: string
  lastName: string
  phone: string
}

export type StaffProfileSeed = {
  name: string
  lastName: string
  phone: string
}

export type OwnerStaffPersonnelRow = {
  staffDocumentId: string
  name: string
  lastName: string
  email: string
  avatar: string | null
  staffStatus: StaffStatus
  clubDocumentId: string
  clubName: string
  role: UserRole
  lastActiveAt: Date
}

export async function findPersonnelByOwnerDocumentId(
  ownerDocumentId: string
): Promise<OwnerStaffPersonnelRow[]> {
  const rows = await db
    .select({
      staffDocumentId: staff.documentId,
      name: staff.name,
      lastName: staff.lastName,
      email: accounts.email,
      avatar: staff.avatar,
      staffStatus: staff.status,
      clubDocumentId: clubs.documentId,
      clubName: clubs.name,
      lastActiveAt: staff.updatedAt,
    })
    .from(staffClubsLnk)
    .innerJoin(staff, eq(staff.id, staffClubsLnk.staffId))
    .innerJoin(clubs, eq(clubs.id, staffClubsLnk.clubId))
    .innerJoin(owners, eq(owners.id, clubs.ownerId))
    .innerJoin(staffAccountsLnk, eq(staffAccountsLnk.staffId, staff.id))
    .innerJoin(accounts, eq(accounts.id, staffAccountsLnk.accountId))
    .where(eq(owners.documentId, ownerDocumentId))
    .orderBy(desc(staff.updatedAt))

  return rows.map((row) => ({ ...row, role: USER_ROLE.STAFF }))
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

export async function findCurrentStaffByDocumentId(
  documentId: string
): Promise<CurrentStaffRow | null> {
  const [row] = await db
    .select({
      documentId: staff.documentId,
      name: staff.name,
      lastName: staff.lastName,
      avatar: staff.avatar,
      phone: staff.phone,
      status: staff.status,
      email: accounts.email,
    })
    .from(staff)
    .innerJoin(staffAccountsLnk, eq(staffAccountsLnk.staffId, staff.id))
    .innerJoin(accounts, eq(accounts.id, staffAccountsLnk.accountId))
    .where(eq(staff.documentId, documentId))
    .limit(1)

  return row ?? null
}

export async function updateStaffProfileByDocumentId(
  documentId: string,
  input: StaffProfileUpdateInput
): Promise<void> {
  await db
    .update(staff)
    .set({
      name: input.name,
      lastName: input.lastName,
      phone: input.phone,
      updatedAt: new Date(),
    })
    .where(eq(staff.documentId, documentId))
}

async function findStaffOwnershipByDocumentId(
  staffDocumentId: string,
  ownerDocumentId: string
): Promise<{ staffId: number; accountId: number } | null> {
  const [row] = await db
    .select({ staffId: staff.id, accountId: accounts.id })
    .from(staff)
    .innerJoin(staffClubsLnk, eq(staffClubsLnk.staffId, staff.id))
    .innerJoin(clubs, eq(clubs.id, staffClubsLnk.clubId))
    .innerJoin(owners, eq(owners.id, clubs.ownerId))
    .innerJoin(staffAccountsLnk, eq(staffAccountsLnk.staffId, staff.id))
    .innerJoin(accounts, eq(accounts.id, staffAccountsLnk.accountId))
    .where(and(eq(staff.documentId, staffDocumentId), eq(owners.documentId, ownerDocumentId)))
    .limit(1)

  return row ?? null
}

export async function deleteStaffByDocumentId(
  staffDocumentId: string,
  ownerDocumentId: string
): Promise<boolean> {
  const ownership = await findStaffOwnershipByDocumentId(staffDocumentId, ownerDocumentId)
  if (!ownership) return false

  await db.transaction(async (tx: Transaction) => {
    await tx.delete(staffClubsLnk).where(eq(staffClubsLnk.staffId, ownership.staffId))
    await tx.delete(staffAccountsLnk).where(eq(staffAccountsLnk.staffId, ownership.staffId))
    await tx.delete(staff).where(eq(staff.id, ownership.staffId))
    await tx.delete(accounts).where(eq(accounts.id, ownership.accountId))
  })

  return true
}

export async function updateStaffStatusByDocumentId(
  staffDocumentId: string,
  ownerDocumentId: string,
  status: StaffStatus
): Promise<boolean> {
  const ownership = await findStaffOwnershipByDocumentId(staffDocumentId, ownerDocumentId)
  if (!ownership) return false

  await db.update(staff).set({ status }).where(eq(staff.id, ownership.staffId))

  return true
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
