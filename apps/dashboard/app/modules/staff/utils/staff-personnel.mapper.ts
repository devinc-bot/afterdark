import type { StaffPersonnelItem } from '@afterdark/types'
import {
  STAFF_USER_AVATAR_TONE,
  type StaffUserRecord,
} from '~/modules/staff/types/staff-user-record'

const AVATAR_TONES = Object.values(STAFF_USER_AVATAR_TONE)

const STAFF_LAST_ACTIVE_FORMATTER = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

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
  if (Number.isNaN(lastActiveAt.getTime())) {
    return '—'
  }

  return STAFF_LAST_ACTIVE_FORMATTER.format(lastActiveAt)
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
    clubId: item.clubId,
    clubName: item.clubName,
    role: item.role,
    status: item.status,
    lastActiveAt: lastActiveAt.getTime(),
    lastActiveLabel: formatLastActiveLabel(lastActiveAt),
    avatarUrl: resolveAvatarUrl(item.avatar),
    avatarClassName: getAvatarToneClassName(item.documentId),
  }
}
