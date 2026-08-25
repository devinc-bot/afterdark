import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { STAFF_INVITATION_STATUS, USER_ROLE } from '@repo/types/enums'
import { createBaseColumns } from './base.ts'
import { organizations } from './organization.ts'
import { owners } from './owner.ts'

export const staffInvitations = pgTable('staff_invitations', {
  ...createBaseColumns('staff_invitations'),
  email: text('email').notNull(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => organizations.id),
  invitedByOwnerId: integer('invited_by_owner_id')
    .notNull()
    .references(() => owners.id),
  slug: text('slug').notNull(),
  token: text('token').notNull().unique(),
  securityWordHash: text('security_word_hash'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
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
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
})

export type StaffInvitationSelect = typeof staffInvitations.$inferSelect
export type StaffInvitationInsert = typeof staffInvitations.$inferInsert
