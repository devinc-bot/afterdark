import type { LoginResponse } from '@repo/types'
import { SESSION_DURATION_MS } from '../constants/auth-storage.ts'
import { deleteCookie, getCookieSync, setCookie } from './cookies.ts'

export type CreateAuthStorageOptions = {
  cookieName: string
  maxAgeMs?: number
}

export function createAuthStorage(options: CreateAuthStorageOptions) {
  const accessTokenCookie = { name: options.cookieName } as const
  const maxAgeMs = options.maxAgeMs ?? SESSION_DURATION_MS

  function saveAuthSession(session: LoginResponse): void {
    setCookie({
      ...accessTokenCookie,
      value: session.accessToken,
      maxAgeMs,
    })
  }

  function getAuthSession(): LoginResponse | null {
    const accessToken = getCookieSync(accessTokenCookie)
    if (!accessToken) return null

    return { accessToken }
  }

  function getAccessTokenSync(): string | null {
    return getCookieSync(accessTokenCookie)
  }

  function clearAuthSession(): void {
    deleteCookie(accessTokenCookie)
  }

  return {
    saveAuthSession,
    getAuthSession,
    getAccessTokenSync,
    clearAuthSession,
  }
}
