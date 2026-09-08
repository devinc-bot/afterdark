import type { AuthOauthApp } from '@repo/types'
import { USER_ROLE } from '@repo/types'
import { API_ROUTES, buildApiPath } from '../config/api-routes.ts'

export function buildGoogleOauthStartUrl(input: {
  role: typeof USER_ROLE.USER | typeof USER_ROLE.OWNER
  app: AuthOauthApp
  apiUrl: string
  legalAccepted?: boolean
}): string {
  const url = new URL(buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.google()), input.apiUrl)
  url.searchParams.set('role', input.role)
  url.searchParams.set('app', input.app)
  if (input.legalAccepted === true) {
    url.searchParams.set('legalAccepted', 'true')
  }
  return url.href
}

export function googleOauthErrorMessageKey(
  error: string | undefined
):
  | 'google.errors.emailExists'
  | 'google.errors.pendingApproval'
  | 'google.errors.registerRequired'
  | 'google.errors.generic' {
  if (error === 'email_exists') return 'google.errors.emailExists'
  if (error === 'google_pending_approval') return 'google.errors.pendingApproval'
  if (error === 'register_required') return 'google.errors.registerRequired'
  return 'google.errors.generic'
}
