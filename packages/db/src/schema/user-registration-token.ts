import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'

export const userRegistrationTokens = sqliteTable('user_registration_tokens', {
  ...createBaseColumns('user_registration_tokens'),
  token: text('token').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  lastName: text('last_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  usedAt: integer('used_at', { mode: 'timestamp' }),
})

export type UserRegistrationTokenSelect = typeof userRegistrationTokens.$inferSelect
export type UserRegistrationTokenInsert = typeof userRegistrationTokens.$inferInsert
