import type { UserRole } from '@afterdark/types'

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface LoginResponse {
  accessToken: string
  user: AuthenticatedUser
}
