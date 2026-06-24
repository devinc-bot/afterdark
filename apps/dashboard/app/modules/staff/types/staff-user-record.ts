import { USER_ROLE, STAFF_STATUS, type StaffStatus, type UserRole } from '@afterdark/types'

export type StaffUserRecord = {
  id: string
  name: string
  email: string
  clubId: string
  clubName: string
  role: UserRole
  lastActiveLabel: string
  lastActiveAt: number
  status: StaffStatus
  avatarClassName: string
}

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const MOCK_NOW_MS = Date.now()

export const STAFF_USER_AVATAR_TONE = {
  primary: 'border-primary/40 bg-primary/20 text-primary',
  tertiary: 'border-tertiary/40 bg-tertiary/15 text-tertiary',
  neutral: 'border-hairline-strong bg-surface-container-high text-ink-muted',
  secondary: 'border-secondary/50 bg-secondary/20 text-secondary',
} as const

export const STAFF_USER_RECORDS_MOCK: StaffUserRecord[] = [
  {
    id: '1',
    name: 'Marco Valdivia',
    email: 'marco.v@afterdark.com',
    clubId: 'neon_lounge',
    clubName: 'Neon Lounge',
    role: USER_ROLE.STAFF,
    lastActiveLabel: 'Hace 2 min',
    lastActiveAt: MOCK_NOW_MS - 2 * MINUTE_MS,
    status: STAFF_STATUS.ACTIVE,
    avatarClassName: STAFF_USER_AVATAR_TONE.primary,
  },
  {
    id: '2',
    name: 'Elena Rodriguez',
    email: 'elena.r@afterdark.com',
    clubId: 'cyber_disco',
    clubName: 'Cyber Disco',
    role: USER_ROLE.STAFF,
    lastActiveLabel: 'Hace 1 h',
    lastActiveAt: MOCK_NOW_MS - HOUR_MS,
    status: STAFF_STATUS.ACTIVE,
    avatarClassName: STAFF_USER_AVATAR_TONE.tertiary,
  },
  {
    id: '3',
    name: 'Lucas Meyer',
    email: 'l.meyer@afterdark.com',
    clubId: 'underground_hub',
    clubName: 'Underground Hub',
    role: USER_ROLE.STAFF,
    lastActiveLabel: 'Sin conexión',
    lastActiveAt: MOCK_NOW_MS - 24 * HOUR_MS,
    status: STAFF_STATUS.INACTIVE,
    avatarClassName: STAFF_USER_AVATAR_TONE.neutral,
  },
  {
    id: '4',
    name: 'Sofia Chen',
    email: 'sofia.c@afterdark.com',
    clubId: 'neon_lounge',
    clubName: 'Neon Lounge',
    role: USER_ROLE.STAFF,
    lastActiveLabel: 'Hace 12 min',
    lastActiveAt: MOCK_NOW_MS - 12 * MINUTE_MS,
    status: STAFF_STATUS.ACTIVE,
    avatarClassName: STAFF_USER_AVATAR_TONE.secondary,
  },
]
