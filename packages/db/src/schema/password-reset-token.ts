import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { accounts } from './account.ts'
import { createBaseColumns } from './base.ts'

export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  ...createBaseColumns('password_reset_tokens'),
  accountId: integer('account_id')
    .notNull()
    .references(() => accounts.id),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  usedAt: integer('used_at', { mode: 'timestamp' }),
})

export type PasswordResetTokenSelect = typeof passwordResetTokens.$inferSelect
export type PasswordResetTokenInsert = typeof passwordResetTokens.$inferInsert
