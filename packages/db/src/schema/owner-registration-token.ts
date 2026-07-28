import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'

export const ownerRegistrationTokens = sqliteTable('owner_registration_tokens', {
  ...createBaseColumns('owner_registration_tokens'),
  token: text('token').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  lastName: text('last_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  usedAt: integer('used_at', { mode: 'timestamp' }),
})

export type OwnerRegistrationTokenSelect = typeof ownerRegistrationTokens.$inferSelect
export type OwnerRegistrationTokenInsert = typeof ownerRegistrationTokens.$inferInsert
