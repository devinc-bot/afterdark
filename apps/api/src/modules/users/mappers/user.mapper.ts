import type { UserProfileRow } from '@afterdark/types'
import { USER_ROLE, type CurrentUserResponse } from '@afterdark/types'

export function toCurrentUserResponse(row: UserProfileRow): CurrentUserResponse {
  return {
    sub: row.documentId,
    name: row.name,
    lastName: row.lastName,
    email: row.email,
    avatar: row.avatar,
    phone: row.phone,
    role: USER_ROLE.USER,
  }
}
