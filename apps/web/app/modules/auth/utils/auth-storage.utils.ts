import type { LoginResponse } from '../types/auth.types'

const AUTH_STORAGE_KEY = 'afterdark.auth'

export function saveAuthSession(session: LoginResponse): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function getAuthSession(): LoginResponse | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as LoginResponse
  } catch {
    return null
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
