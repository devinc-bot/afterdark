import type { CurrentUserResponse } from '@afterdark/types'

function getFirstGrapheme(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return [...trimmed][0] ?? ''
}

export function getUserInitials(name: string, lastName: string): string {
  const first = getFirstGrapheme(name)
  const last = getFirstGrapheme(lastName)
  const initials = `${first}${last}`.toLocaleUpperCase('es-AR')

  return initials || '?'
}

export function getUserDisplayName(
  user: Pick<CurrentUserResponse, 'name' | 'lastName' | 'email'>,
  fallbackName: string
): string {
  const fullName = `${user.name ?? ''} ${user.lastName ?? ''}`.trim()

  return fullName || user.email.trim() || fallbackName
}

export function buildProfileLinkAriaLabel(
  displayName: string,
  email: string,
  actionLabel: string
): string {
  return `${actionLabel}: ${displayName} (${email})`
}
