function getFirstGrapheme(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return [...trimmed][0] ?? ''
}

export function getStaffUserInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  const first = getFirstGrapheme(parts[0] ?? '')
  const last = getFirstGrapheme(parts.length > 1 ? parts[parts.length - 1]! : '')
  const initials = `${first}${last}`.toLocaleUpperCase('es-AR')

  return initials || '?'
}

export function getStaffUserDisplayNameFromEmail(email: string): string {
  const [localPart = email] = email.trim().split('@')
  const normalized = localPart.replace(/[._-]+/g, ' ').trim()
  if (!normalized) return email

  return normalized
    .split(/\s+/)
    .map((part) => part.charAt(0).toLocaleUpperCase('es-AR') + part.slice(1))
    .join(' ')
}
