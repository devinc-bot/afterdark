import type {
  AdminUserListItemResponse,
  AdminUserTogglableStatus,
  PaginatedResponse,
} from '@repo/types'
import type { ListAdminUsersQueryInput } from '@repo/validators'
import { i18n } from '@repo/i18n/client'
import { buildApiPath, toApiServiceError } from '@repo/common'
import { api, API_ROUTES } from '~/config/api'

function toAdminUsersSearchParams(params: ListAdminUsersQueryInput): string {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  })

  if (params.email) searchParams.set('email', params.email)
  if (params.role) searchParams.set('role', params.role)

  return searchParams.toString()
}

export async function fetchAdminUsers(
  params: ListAdminUsersQueryInput
): Promise<PaginatedResponse<AdminUserListItemResponse>> {
  const query = toAdminUsersSearchParams(params)
  const path = buildApiPath(API_ROUTES.users, API_ROUTES.users.path.list())

  try {
    return await api.get<PaginatedResponse<AdminUserListItemResponse>>(`${path}?${query}`)
  } catch (error) {
    throw toApiServiceError(error, i18n.t('admin:users.list.error'))
  }
}

export async function updateAdminUserStatus(
  documentId: string,
  status: AdminUserTogglableStatus
): Promise<void> {
  const path = buildApiPath(API_ROUTES.users, API_ROUTES.users.path.updateStatus(documentId))

  try {
    await api.patch<void>(path, { status })
  } catch (error) {
    throw toApiServiceError(error, i18n.t('admin:users.status.error'))
  }
}
