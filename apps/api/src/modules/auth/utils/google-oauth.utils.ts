import { AUTH_OAUTH_APP, type AuthOauthApp } from '@repo/types'
import { CLIENT_ROUTES } from '@repo/common'
import { ENV } from '../../../config/env'
import type { GoogleOauthErrorCode } from '../auth.constants'

function appOrigin(app: AuthOauthApp, path: string): URL {
  if (app === AUTH_OAUTH_APP.WEB) return new URL(path, ENV.WEB_URL)
  if (app === AUTH_OAUTH_APP.DASHBOARD) return new URL(path, ENV.DASHBOARD_URL)
  throw new Error(`Invalid app: ${app}`)
}

export function buildAppLoginErrorUrl(app: AuthOauthApp, error: GoogleOauthErrorCode): string {
  const url = appOrigin(app, CLIENT_ROUTES.login())
  url.searchParams.set('error', error)
  return url.toString()
}

export function buildAppAuthCallbackUrl(app: AuthOauthApp, accessToken: string): string {
  const url = appOrigin(app, CLIENT_ROUTES.authCallback())
  url.searchParams.set('token', accessToken)
  return url.toString()
}
