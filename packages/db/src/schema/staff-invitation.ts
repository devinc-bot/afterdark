import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { STAFF_INVITATION_STATUS, USER_ROLE } from '@afterdark/types'
import { createBaseColumns } from './base.ts'
import { clubs } from './club.ts'

export const staffInvitations = sqliteTable('staff_invitations', {
  ...createBaseColumns('staff_invitations'),
  email: text('email').notNull(),
  clubId: integer('club_id')
    .notNull()
    .references(() => clubs.id),
  slug: text('slug').notNull(),
  token: text('token').notNull().unique(),
  securityWordHash: text('security_word_hash'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  status: text('status', {
    enum: [
      STAFF_INVITATION_STATUS.PENDING,
      STAFF_INVITATION_STATUS.ACCEPTED,
      STAFF_INVITATION_STATUS.EXPIRED,
      STAFF_INVITATION_STATUS.CANCELLED,
    ],
  })
    .notNull()
    .default(STAFF_INVITATION_STATUS.PENDING),
  role: text('role', {
    enum: [USER_ROLE.USER, USER_ROLE.OWNER, USER_ROLE.STAFF],
  })
    .notNull()
    .default(USER_ROLE.STAFF),
  acceptedAt: integer('accepted_at', { mode: 'timestamp' }),
})

export type StaffInvitationSelect = typeof staffInvitations.$inferSelect
export type StaffInvitationInsert = typeof staffInvitations.$inferInsert
