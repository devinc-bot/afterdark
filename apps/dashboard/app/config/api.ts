import type { CurrentUserResponse } from '@afterdark/types'
import { API_BASE_URL, API_ROUTES } from '~/config/constants/api'
import { QueryFactory } from '~/modules/shared/utils/query-factory'

export const api = new QueryFactory(API_BASE_URL)

function usersApiPath(path: string) {
  return `${API_ROUTES.users.prefix}${path}`
}

export function getCurrentUser() {
  return api.get<CurrentUserResponse>(usersApiPath(API_ROUTES.users.path.me()))
}
