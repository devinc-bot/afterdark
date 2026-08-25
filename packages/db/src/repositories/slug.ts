/** Normalizes a display name into a stable URL segment. */
export function normalizeSlug(value: string): string {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'item'
}

/** Allocates the first available base, base-2, base-3, ... candidate. */
export function allocateSlug(value: string, usedSlugs: Iterable<string>): string {
  const used = new Set(usedSlugs)
  const base = normalizeSlug(value)

  if (!used.has(base)) {
    return base
  }

  let suffix = 2
  while (used.has(`${base}-${suffix}`)) {
    suffix += 1
  }

  return `${base}-${suffix}`
}
