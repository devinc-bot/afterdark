import { STAFF_INVITATION_EXPIRY_OPTIONS } from '@afterdark/validators'
import { hashValue } from '../../common'

export const STAFF_INVITATION_PAYLOAD_VERSION = 1.1 as const

export type StaffInvitationPayload = {
  v: typeof STAFF_INVITATION_PAYLOAD_VERSION
  email: string
  clubId: string
  slug: string
}

/**
 * Normalizes a string segment into a URL-safe slug.
 *
 * Strips diacritics (accents), lowercases, replaces any run of
 * non-alphanumeric characters with a single hyphen, and trims
 * leading/trailing hyphens.
 *
 * @example
 * slugifySegment('Ñoño García')  // → 'nono-garcia'
 * slugifySegment('  Hello World!!  ') // → 'hello-world'
 * slugifySegment('café@2024')    // → 'cafe-2024'
 * slugifySegment('---')          // → ''
 */
function slugifySegment(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function slugifyStaffInvitationEmail(email: string): string {
  // example: 'juan@afterdark.com' -> 'juan-afterdark-com'
  const [localPart = '', domain = ''] = email.trim().toLowerCase().split('@')
  const localSlug = slugifySegment(localPart)
  if (localSlug) return localSlug

  // example: 'afterdark.com' -> 'afterdark-com'
  const domainSlug = slugifySegment(domain.replace(/\./g, '-'))
  return domainSlug
}

export function buildStaffInvitationPath(slug: string, token: string): string {
  return `/${slug}/${token}`
}

/**
 * Builds a staff invitation URL.
 *
 * @example
 * buildStaffInvitationUrl('https://dashboard.afterdark.com', 'example-afterdark-com', '1234567890') // → 'https://dashboard.afterdark.com/example-afterdark-com/1234567890'
 */
export function buildStaffInvitationUrl(origin: string, slug: string, token: string): string {
  const normalizedOrigin = origin.replace(/\/$/, '')
  return `${normalizedOrigin}${buildStaffInvitationPath(slug, token)}`
}

export async function buildStaffInvitationPayload(input: {
  email: string
  clubDocumentId: string
  securityWord?: string
  expiresInMs?: number
  now?: number
}): Promise<{
  payload: StaffInvitationPayload
  slug: string
  expiresAt: Date
  expiresInSeconds: number
  securityWordHash?: string
}> {
  const now = input.now ?? Date.now()
  const expiresInMs = input.expiresInMs ?? STAFF_INVITATION_EXPIRY_OPTIONS['12h']
  const expiresAt = new Date(now + expiresInMs)
  const slug = slugifyStaffInvitationEmail(input.email)
  const trimmedSecurityWord = input.securityWord?.trim() ?? ''

  const securityWordHash =
    trimmedSecurityWord.length > 0 ? await hashValue(trimmedSecurityWord) : undefined

  const payload: StaffInvitationPayload = {
    v: STAFF_INVITATION_PAYLOAD_VERSION,
    email: input.email,
    clubId: input.clubDocumentId,
    slug,
  }

  return {
    payload,
    slug,
    expiresAt,
    expiresInSeconds: Math.floor(expiresInMs / 1000),
    ...(securityWordHash ? { securityWordHash } : {}),
  }
}
