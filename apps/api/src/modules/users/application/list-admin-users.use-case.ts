import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  findAccountsWithRolePaginated,
  type AdminUserListRow,
  type PaginatedAdminUsersResult,
} from '@repo/db'
import type {
  AdminUserListItemResponse,
  AdminUserStatus,
  PaginatedResponse,
  UserRole,
} from '@repo/types'
import type { ListAdminUsersQueryInput } from '@repo/validators'
import { TranslationService } from '@repo/i18n/server'

@Injectable()
export class ListAdminUsersUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(
    query: ListAdminUsersQueryInput
  ): Promise<PaginatedResponse<AdminUserListItemResponse>> {
    try {
      const { rows, total }: PaginatedAdminUsersResult = await findAccountsWithRolePaginated({
        page: query.page,
        limit: query.limit,
        email: query.email,
        role: query.role,
      })

      const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit)

      return {
        data: rows.map(toAdminUserListItemResponse),
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      }
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('admin.USERS_LIST_FAILED'))
    }
  }
}

export function toAdminUserListItemResponse(row: AdminUserListRow): AdminUserListItemResponse {
  const name = row.userName ?? row.ownerName ?? row.staffName ?? null
  const lastName = row.userLastName ?? row.ownerLastName ?? row.staffLastName ?? null
  const status = (row.userStatus ??
    row.ownerStatus ??
    row.staffStatus ??
    null) as AdminUserStatus | null

  return {
    documentId: row.documentId,
    email: row.email,
    name,
    lastName,
    role: row.roleName as UserRole,
    status,
    createdAt: row.createdAt.toISOString(),
  }
}
