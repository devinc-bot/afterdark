import type { LoginResponse } from '@afterdark/types'
import { SESSION_DURATION_MS } from '~/modules/common/constants/auth-storage'
import { COOKIE_KEYS } from '~/modules/common/constants/cookies'
import { deleteCookie, getCookieSync, setCookie } from '~/modules/common/utils/cookies.utils'

const accessTokenCookie = { name: COOKIE_KEYS.accessToken } as const

export function saveAuthSession(session: LoginResponse): void {
  setCookie({
    ...accessTokenCookie,
    value: session.accessToken,
    maxAgeMs: SESSION_DURATION_MS,
  })
}

export function getAuthSession(): LoginResponse | null {
  const accessToken = getCookieSync(accessTokenCookie)
  if (!accessToken) return null

  return { accessToken }
}

export function getAccessTokenSync(): string | null {
  return getCookieSync(accessTokenCookie)
}

export function clearAuthSession(): void {
  deleteCookie(accessTokenCookie)
}
