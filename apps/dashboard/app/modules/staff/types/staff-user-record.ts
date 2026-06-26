import type { StaffStatus, UserRole } from '@afterdark/types'

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
  avatarUrl: string | null
  avatarClassName: string
}

export const STAFF_USER_AVATAR_TONE = {
  primary: 'border-primary/40 bg-primary/20 text-primary',
  tertiary: 'border-tertiary/40 bg-tertiary/15 text-tertiary',
  neutral: 'border-hairline-strong bg-surface-container-high text-ink-muted',
  secondary: 'border-secondary/50 bg-secondary/20 text-secondary',
} as const
