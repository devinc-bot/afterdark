import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { accounts } from './account.ts'
import { createBaseColumns } from './base.ts'

export const passwordResetTokens = pgTable('password_reset_tokens', {
  ...createBaseColumns('password_reset_tokens'),
  accountId: integer('account_id')
    .notNull()
    .references(() => accounts.id),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
})

export type PasswordResetTokenSelect = typeof passwordResetTokens.$inferSelect
export type PasswordResetTokenInsert = typeof passwordResetTokens.$inferInsert
