import { AUTH_OAUTH_APP, type AuthOauthApp } from '@repo/types'
import { CLIENT_ROUTES } from '@repo/common'
import { ENV } from '../../common/config/env'
import type { GoogleOauthErrorCode } from '../auth.constants'

function appOrigin(app: AuthOauthApp): string {
  return app === AUTH_OAUTH_APP.WEB ? ENV.WEB_URL : ENV.DASHBOARD_URL
}

export function buildAppLoginErrorUrl(app: AuthOauthApp, error: GoogleOauthErrorCode): string {
  const url = new URL(CLIENT_ROUTES.login(), appOrigin(app))
  url.searchParams.set('error', error)
  return url.toString()
}

export function buildAppAuthCallbackUrl(app: AuthOauthApp, accessToken: string): string {
  const url = new URL(CLIENT_ROUTES.authCallback(), appOrigin(app))
  url.searchParams.set('token', accessToken)
  return url.toString()
}
