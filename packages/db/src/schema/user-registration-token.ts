import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createBaseColumns } from './base.ts'

export const userRegistrationTokens = pgTable('user_registration_tokens', {
  ...createBaseColumns('user_registration_tokens'),
  token: text('token').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  lastName: text('last_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
})

export type UserRegistrationTokenSelect = typeof userRegistrationTokens.$inferSelect
export type UserRegistrationTokenInsert = typeof userRegistrationTokens.$inferInsert
