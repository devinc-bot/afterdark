import type { StaffPersonnelItem } from '@repo/types'
import { formatDate } from '@repo/common'
import {
  STAFF_USER_AVATAR_TONE,
  type StaffUserRecord,
} from '~/modules/staff/types/staff-user-record'

const AVATAR_TONES = Object.values(STAFF_USER_AVATAR_TONE)

function hashDocumentId(documentId: string): number {
  let hash = 0
  for (const char of documentId) {
    hash = (hash + char.charCodeAt(0)) % AVATAR_TONES.length
  }
  return Math.abs(hash) % AVATAR_TONES.length
}

function getAvatarToneClassName(documentId: string): string {
  return AVATAR_TONES[hashDocumentId(documentId)] ?? STAFF_USER_AVATAR_TONE.neutral
}

function parseLastActiveAt(value: StaffPersonnelItem['lastActiveAt']): Date {
  return value instanceof Date ? value : new Date(value)
}

function formatLastActiveLabel(lastActiveAt: Date): string {
  return formatDate(lastActiveAt, {
    locale: 'es-AR',
    options: { dateStyle: 'short', timeStyle: 'short' },
    fallback: '—',
  })
}

function resolveAvatarUrl(avatar: string | null): string | null {
  if (!avatar?.trim()) return null
  return avatar.trim()
}

export function mapStaffPersonnelItemToStaffUserRecord(item: StaffPersonnelItem): StaffUserRecord {
  const lastActiveAt = parseLastActiveAt(item.lastActiveAt)

  return {
    id: item.documentId,
    name: item.name,
    email: item.email,
    clubId: item.locationId,
    clubName: item.locationName,
    role: item.role,
    status: item.status,
    lastActiveAt: lastActiveAt.getTime(),
    lastActiveLabel: formatLastActiveLabel(lastActiveAt),
    avatarUrl: resolveAvatarUrl(item.avatar),
    avatarClassName: getAvatarToneClassName(item.documentId),
  }
}
