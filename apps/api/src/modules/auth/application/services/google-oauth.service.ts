import { Injectable, Logger } from '@nestjs/common'
import { API_ROUTES, buildApiPath } from '@repo/common'
import { ENV } from '../../../common/config/env'
import { GOOGLE_OAUTH_SCOPES } from '../../auth.constants'

export type GoogleUserProfile = {
  providerAccountId: string
  email: string
  name: string
  lastName: string
}

type GoogleTokenResponse = {
  access_token?: string
  id_token?: string
  error?: string
}

type GoogleUserInfoResponse = {
  sub?: string
  email?: string
  email_verified?: boolean
  given_name?: string
  family_name?: string
  name?: string
}

@Injectable()
export class GoogleOauthService {
  private readonly logger = new Logger(GoogleOauthService.name)

  isConfigured(): boolean {
    return Boolean(ENV.GOOGLE_CLIENT_ID && ENV.GOOGLE_CLIENT_SECRET)
  }

  getRedirectUri(): string {
    return `${ENV.API_PUBLIC_URL}/${buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.googleCallback())}`
  }

  buildAuthorizationUrl(state: string): string {
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    url.searchParams.set('client_id', ENV.GOOGLE_CLIENT_ID)
    url.searchParams.set('redirect_uri', this.getRedirectUri())
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', GOOGLE_OAUTH_SCOPES.join(' '))
    url.searchParams.set('state', state)
    url.searchParams.set('access_type', 'online')
    url.searchParams.set('prompt', 'select_account')
    return url.toString()
  }

  async exchangeCodeForProfile(code: string): Promise<GoogleUserProfile> {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: ENV.GOOGLE_CLIENT_ID,
        client_secret: ENV.GOOGLE_CLIENT_SECRET,
        redirect_uri: this.getRedirectUri(),
        grant_type: 'authorization_code',
      }),
    })

    const tokenJson = (await tokenResponse.json()) as GoogleTokenResponse

    if (!tokenResponse.ok || !tokenJson.access_token) {
      this.logger.warn(`Google token exchange failed: ${tokenJson.error ?? tokenResponse.status}`)
      throw new Error('Google token exchange failed')
    }

    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    })

    const userInfo = (await userInfoResponse.json()) as GoogleUserInfoResponse

    if (!userInfoResponse.ok || !userInfo.sub || !userInfo.email) {
      this.logger.warn('Google userinfo missing sub or email')
      throw new Error('Google userinfo failed')
    }

    return {
      providerAccountId: userInfo.sub,
      email: userInfo.email.toLowerCase(),
      name: normalizeNamePart(userInfo.given_name, userInfo.name?.split(/\s+/)[0], 'Usuario'),
      lastName: normalizeNamePart(
        userInfo.family_name,
        userInfo.name?.split(/\s+/).slice(1).join(' '),
        'Google'
      ),
    }
  }
}

function normalizeNamePart(
  primary: string | undefined,
  fallback: string | undefined,
  defaultValue: string
): string {
  const value = (primary?.trim() || fallback?.trim() || defaultValue).slice(0, 255)
  return value.length >= 2 ? value : defaultValue
}
