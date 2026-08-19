import { and, count, desc, eq, like } from 'drizzle-orm'
import type { UserRole } from '@repo/types'
import { accountRolesLnk } from '../../schema/account-role-lnk.ts'
import { accounts } from '../../schema/account.ts'
import { ownerAccountsLnk } from '../../schema/owner-account-lnk.ts'
import { owners } from '../../schema/owner.ts'
import { roles } from '../../schema/role.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'
import { staff } from '../../schema/staff.ts'
import { userAccountsLnk } from '../../schema/user-account-lnk.ts'
import { users } from '../../schema/user.ts'
import { db } from '../../client.ts'

export type FindAccountsWithRolePaginatedParams = {
  page: number
  limit: number
  email?: string
  role?: UserRole
}

export type AdminUserListRow = {
  documentId: string
  email: string
  createdAt: Date
  roleName: string
  userName: string | null
  userLastName: string | null
  ownerName: string | null
  ownerLastName: string | null
  staffName: string | null
  staffLastName: string | null
  userStatus: string | null
  ownerStatus: string | null
  staffStatus: string | null
}

export type PaginatedAdminUsersResult = {
  rows: AdminUserListRow[]
  total: number
}

export async function findAccountsWithRolePaginated(
  params: FindAccountsWithRolePaginatedParams
): Promise<PaginatedAdminUsersResult> {
  const { page, limit } = params
  const offset = (page - 1) * limit

  const conditions = []
  if (params.email) {
    conditions.push(like(accounts.email, `%${params.email}%`))
  }
  if (params.role) {
    conditions.push(eq(roles.name, params.role))
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        documentId: accounts.documentId,
        email: accounts.email,
        createdAt: accounts.createdAt,
        roleName: roles.name,
        userName: users.name,
        userLastName: users.lastName,
        ownerName: owners.name,
        ownerLastName: owners.lastName,
        staffName: staff.name,
        staffLastName: staff.lastName,
        userStatus: users.status,
        ownerStatus: owners.status,
        staffStatus: staff.status,
      })
      .from(accounts)
      .innerJoin(accountRolesLnk, eq(accountRolesLnk.accountId, accounts.id))
      .innerJoin(roles, eq(roles.id, accountRolesLnk.roleId))
      .leftJoin(userAccountsLnk, eq(userAccountsLnk.accountId, accounts.id))
      .leftJoin(users, eq(users.id, userAccountsLnk.userId))
      .leftJoin(ownerAccountsLnk, eq(ownerAccountsLnk.accountId, accounts.id))
      .leftJoin(owners, eq(owners.id, ownerAccountsLnk.ownerId))
      .leftJoin(staffAccountsLnk, eq(staffAccountsLnk.accountId, accounts.id))
      .leftJoin(staff, eq(staff.id, staffAccountsLnk.staffId))
      .where(where)
      .orderBy(desc(accounts.createdAt), desc(accounts.id))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(accounts)
      .innerJoin(accountRolesLnk, eq(accountRolesLnk.accountId, accounts.id))
      .innerJoin(roles, eq(roles.id, accountRolesLnk.roleId))
      .where(where),
  ])

  return {
    rows: rows as AdminUserListRow[],
    total: totalRows[0]?.total ?? 0,
  }
}
