import { USER_ROLE, type SessionResponse } from '@repo/types'

export function isAdminSession(session: SessionResponse | null): boolean {
  return session?.role === USER_ROLE.ADMIN
}
