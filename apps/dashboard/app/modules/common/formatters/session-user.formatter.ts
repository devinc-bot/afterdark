import type { BaseProfileResponse, SessionResponse } from '@afterdark/types'

export function toSessionUser(
  user: Pick<BaseProfileResponse, 'sub' | 'name' | 'lastName' | 'email' | 'avatar' | 'role'>
): SessionResponse {
  return {
    sub: user.sub,
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
  }
}
