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
