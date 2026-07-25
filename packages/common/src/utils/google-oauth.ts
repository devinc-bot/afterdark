import type { AuthOauthApp } from '@repo/types'
import { USER_ROLE } from '@repo/types'
import { API_ROUTES, buildApiPath } from '../config/api-routes.ts'
import { API_URL } from '../constants/api.ts'

export function buildGoogleOauthStartUrl(input: {
  role: typeof USER_ROLE.USER | typeof USER_ROLE.OWNER
  app: AuthOauthApp
}): string {
  const url = new URL(buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.google()), API_URL)
  url.searchParams.set('role', input.role)
  url.searchParams.set('app', input.app)
  return url.href
}

export function googleOauthErrorMessageKey(
  error: string | undefined
): 'google.errors.emailExists' | 'google.errors.generic' {
  if (error === 'email_exists') return 'google.errors.emailExists'
  return 'google.errors.generic'
}
