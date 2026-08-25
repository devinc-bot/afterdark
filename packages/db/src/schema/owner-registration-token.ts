import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createBaseColumns } from './base.ts'

export const ownerRegistrationTokens = pgTable('owner_registration_tokens', {
  ...createBaseColumns('owner_registration_tokens'),
  token: text('token').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  lastName: text('last_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
})

export type OwnerRegistrationTokenSelect = typeof ownerRegistrationTokens.$inferSelect
export type OwnerRegistrationTokenInsert = typeof ownerRegistrationTokens.$inferInsert
