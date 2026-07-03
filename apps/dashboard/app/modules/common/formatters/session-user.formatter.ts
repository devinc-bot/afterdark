import type { CurrentOwnerResponse, SessionResponse } from '@afterdark/types'

export function toSessionUser(
  owner: Pick<CurrentOwnerResponse, 'sub' | 'name' | 'lastName' | 'email' | 'avatar'>
): SessionResponse {
  return {
    sub: owner.sub,
    name: owner.name,
    lastName: owner.lastName,
    email: owner.email,
    avatar: owner.avatar,
  }
}
