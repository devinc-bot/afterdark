import { AUTH_OAUTH_APP, type AuthOauthApp } from '@repo/types'
import { CLIENT_ROUTES } from '@repo/common'
import { ENV } from '../../../config/env'
import type { GoogleOauthErrorCode } from '../auth.constants'

const APPS = [AUTH_OAUTH_APP.WEB, AUTH_OAUTH_APP.DASHBOARD]

function appOrigin(app: AuthOauthApp, path: string): URL {
  if (APPS.includes(app)) {
    return new URL(path, ENV.API_PUBLIC_URL)
  }
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
