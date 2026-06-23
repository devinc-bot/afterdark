import { createHash } from 'node:crypto'

export const STAFF_INVITATION_TTL_MS = 5 * 60 * 1000
export const STAFF_INVITATION_PAYLOAD_VERSION = 1 as const

export type StaffInvitationPayload = {
  v: typeof STAFF_INVITATION_PAYLOAD_VERSION
  email: string
  clubId: string
  slug: string
  exp: number
  securityWordHash?: string
}

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function hashStaffInvitationSecurityWord(securityWord: string): string {
  return createHash('sha256').update(securityWord).digest('hex')
}

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
  const [localPart = '', domain = ''] = email.trim().toLowerCase().split('@')
  const localSlug = slugifySegment(localPart)
  if (localSlug) return localSlug

  const domainSlug = slugifySegment(domain.replace(/\./g, '-'))
  return domainSlug || 'invitacion'
}

export function encodeStaffInvitationToken(payload: StaffInvitationPayload): string {
  return toBase64Url(JSON.stringify(payload))
}

export function buildStaffInvitationPath(slug: string, token: string): string {
  return `/${slug}/${token}`
}

export function buildStaffInvitationUrl(origin: string, slug: string, token: string): string {
  const normalizedOrigin = origin.replace(/\/$/, '')
  return `${normalizedOrigin}${buildStaffInvitationPath(slug, token)}`
}

export function buildStaffInvitationPayload(input: {
  email: string
  clubDocumentId: string
  securityWord?: string
  now?: number
}): {
  payload: StaffInvitationPayload
  token: string
  slug: string
  expiresAt: Date
  securityWordHash?: string
} {
  const now = input.now ?? Date.now()
  const expiresAt = new Date(now + STAFF_INVITATION_TTL_MS)
  const slug = slugifyStaffInvitationEmail(input.email)
  const trimmedSecurityWord = input.securityWord?.trim() ?? ''

  const securityWordHash =
    trimmedSecurityWord.length > 0
      ? hashStaffInvitationSecurityWord(trimmedSecurityWord)
      : undefined

  const payload: StaffInvitationPayload = {
    v: STAFF_INVITATION_PAYLOAD_VERSION,
    email: input.email,
    clubId: input.clubDocumentId,
    slug,
    exp: expiresAt.getTime(),
    ...(securityWordHash ? { securityWordHash } : {}),
  }

  return {
    payload,
    token: encodeStaffInvitationToken(payload),
    slug,
    expiresAt,
    ...(securityWordHash ? { securityWordHash } : {}),
  }
}
