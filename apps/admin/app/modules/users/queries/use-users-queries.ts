import { useQuery } from '@tanstack/react-query'
import type { ListAdminUsersQueryInput } from '@repo/validators'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { fetchAdminUserDetail, fetchAdminUsers } from '~/modules/users/service/users.service'

const DEFAULT_ADMIN_USERS_QUERY: ListAdminUsersQueryInput = {
  page: 1,
  limit: 10,
}

export function useAdminUsers(params: Partial<ListAdminUsersQueryInput> = {}) {
  const query = { ...DEFAULT_ADMIN_USERS_QUERY, ...params }

  return useQuery({
    queryKey: QUERY_KEYS.adminUsers({
      page: query.page,
      limit: query.limit,
      email: query.email,
      role: query.role,
    }),
    queryFn: () => fetchAdminUsers(query),
  })
}

export function useAdminUserDetail(documentId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.adminUserDetail(documentId ?? undefined),
    queryFn: () => fetchAdminUserDetail(documentId as string),
    enabled: documentId !== null,
  })
}
