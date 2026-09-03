import { index, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { CLIENT_APP, SESSION_METADATA_FIELD_LIMITS } from '@repo/types'
import { accounts } from './account.ts'
import { createBaseColumns } from './base.ts'

const ACCOUNT_SESSION_FIELD_LIMITS = {
  ipAddress: 45,
  geographicName: 255,
} as const

export const accountSessions = pgTable(
  'account_sessions',
  {
    ...createBaseColumns('account_sessions'),
    accountId: integer('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    clientApp: text('client_app', {
      enum: [CLIENT_APP.WEB, CLIENT_APP.DASHBOARD, CLIENT_APP.ADMIN],
    }).notNull(),
    refreshTokenHash: text('refresh_token_hash').notNull(),
    refreshTokenVersion: integer('refresh_token_version').notNull().default(0),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    ipAddress: varchar('ip_address', { length: ACCOUNT_SESSION_FIELD_LIMITS.ipAddress }),
    device: varchar('device', { length: SESSION_METADATA_FIELD_LIMITS.device }),
    userAgent: varchar('user_agent', { length: SESSION_METADATA_FIELD_LIMITS.userAgent }),
    city: varchar('city', { length: ACCOUNT_SESSION_FIELD_LIMITS.geographicName }),
    state: varchar('state', { length: ACCOUNT_SESSION_FIELD_LIMITS.geographicName }),
    country: varchar('country', { length: ACCOUNT_SESSION_FIELD_LIMITS.geographicName }),
  },
  (table) => [
    index('account_sessions_account_active_created_at_idx').on(
      table.accountId,
      table.revokedAt,
      table.expiresAt,
      table.createdAt
    ),
    index('account_sessions_terminal_at_idx').on(table.expiresAt, table.revokedAt),
  ]
)

export type AccountSessionSelect = typeof accountSessions.$inferSelect
export type AccountSessionInsert = typeof accountSessions.$inferInsert
