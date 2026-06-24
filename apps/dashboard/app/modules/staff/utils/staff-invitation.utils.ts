import { createStaffInvitationSchema, type CreateStaffInvitationInput } from '@afterdark/validators'
import {
  STAFF_INVITATION_VALIDATION_REASON,
  type StaffInvitationValidationReason,
} from '~/modules/staff/constants/staff-invitation.constants'

export const STAFF_INVITATION_TTL_MS = 5 * 60 * 1000
export const STAFF_INVITATION_PAYLOAD_VERSION = 2 as const

export type StaffInvitationPayload = {
  v: typeof STAFF_INVITATION_PAYLOAD_VERSION
  email: string
  clubId: string
  slug: string
  exp: number
  securityWordHash?: string
}

export type StaffInvitation = {
  payload: StaffInvitationPayload
  token: string
  url: string
  expiresAt: number
}

export type StaffInvitationValidationResult =
  | { ok: true; payload: StaffInvitationPayload }
  | { ok: false; reason: StaffInvitationValidationReason }

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): string | null {
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/')
    const padLength = (4 - (padded.length % 4)) % 4
    const base64 = padded + '='.repeat(padLength)
    const binary = atob(base64)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}

export async function hashStaffInvitationSecurityWord(securityWord: string): Promise<string> {
  const data = new TextEncoder().encode(securityWord)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function staffInvitationRequiresSecurityWord(payload: StaffInvitationPayload): boolean {
  return Boolean(payload.securityWordHash)
}

export async function verifyStaffInvitationSecurityWord(
  payload: StaffInvitationPayload,
  securityWord: string
): Promise<boolean> {
  if (!payload.securityWordHash) return true
  const hash = await hashStaffInvitationSecurityWord(securityWord)
  return hash === payload.securityWordHash
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

export function decodeStaffInvitationToken(token: string): StaffInvitationPayload | null {
  const decoded = fromBase64Url(token)
  if (!decoded) return null

  try {
    const parsed = JSON.parse(decoded) as StaffInvitationPayload
    if (parsed.v !== STAFF_INVITATION_PAYLOAD_VERSION) return null
    if (!parsed.email || !parsed.clubId) return null
    if (!parsed.slug || typeof parsed.exp !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

export function validateStaffInvitation(
  slug: string,
  token: string,
  now = Date.now()
): StaffInvitationValidationResult {
  const payload = decodeStaffInvitationToken(token)
  if (!payload) return { ok: false, reason: STAFF_INVITATION_VALIDATION_REASON.INVALID }
  if (payload.slug !== slug) {
    return { ok: false, reason: STAFF_INVITATION_VALIDATION_REASON.SLUG_MISMATCH }
  }
  if (payload.exp <= now) return { ok: false, reason: STAFF_INVITATION_VALIDATION_REASON.EXPIRED }
  return { ok: true, payload }
}

export function buildStaffInvitationPath(slug: string, token: string): string {
  return `/${slug}/${token}`
}

export function buildStaffInvitationUrl(origin: string, slug: string, token: string): string {
  return `${origin.replace(/\/$/, '')}${buildStaffInvitationPath(slug, token)}`
}

export async function createStaffInvitation(
  input: CreateStaffInvitationInput,
  origin: string,
  now = Date.now()
): Promise<StaffInvitation | null> {
  const parsed = createStaffInvitationSchema.safeParse(input)
  if (!parsed.success) return null

  const slug = slugifyStaffInvitationEmail(parsed.data.email)
  if (!slug) return null

  const expiresAt = now + STAFF_INVITATION_TTL_MS
  const securityWordHash =
    parsed.data.securityWord.length > 0
      ? await hashStaffInvitationSecurityWord(parsed.data.securityWord)
      : undefined

  const payload: StaffInvitationPayload = {
    v: STAFF_INVITATION_PAYLOAD_VERSION,
    email: parsed.data.email,
    clubId: parsed.data.clubId,
    slug,
    exp: expiresAt,
    ...(securityWordHash ? { securityWordHash } : {}),
  }

  const token = encodeStaffInvitationToken(payload)

  return {
    payload,
    token,
    expiresAt,
    url: buildStaffInvitationUrl(origin, slug, token),
  }
}

export function formatInvitationTimeRemaining(expiresAt: number, now = Date.now()): string {
  const remainingMs = Math.max(0, expiresAt - now)
  const totalSeconds = Math.ceil(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
