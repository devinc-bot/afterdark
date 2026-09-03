import { AUTH_OAUTH_APP, type AuthOauthApp } from '@repo/types'
import { CLIENT_ROUTES } from '@repo/common'
import { ENV } from '../../../config/env'
import type { GoogleOauthErrorCode } from '../auth.constants'

export function getGoogleOauthAppOrigin(app: AuthOauthApp): string {
  if (app === AUTH_OAUTH_APP.WEB) return ENV.WEB_URL
  if (app === AUTH_OAUTH_APP.DASHBOARD) return ENV.DASHBOARD_URL
  throw new Error(`Invalid app: ${app}`)
}

function appOrigin(app: AuthOauthApp, path: string): URL {
  return new URL(path, getGoogleOauthAppOrigin(app))
}

export function buildAppLoginErrorUrl(app: AuthOauthApp, error: GoogleOauthErrorCode): string {
  const url = appOrigin(app, CLIENT_ROUTES.login())
  url.searchParams.set('error', error)
  return url.toString()
}

export function buildAppAuthCallbackUrl(app: AuthOauthApp): string {
  return appOrigin(app, CLIENT_ROUTES.authCallback()).toString()
}
