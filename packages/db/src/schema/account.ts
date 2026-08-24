import { pgTable, text } from 'drizzle-orm/pg-core'
import { AUTH_PROVIDER } from '@repo/types'
import { createBaseColumns } from './base.ts'

export const accounts = pgTable('accounts', {
  ...createBaseColumns('accounts'),
  email: text('email').notNull().unique(),
  password: text('password'),
  provider: text('provider', { enum: [AUTH_PROVIDER.LOCAL, AUTH_PROVIDER.GOOGLE] })
    .notNull()
    .default(AUTH_PROVIDER.LOCAL),
  providerAccountId: text('provider_account_id').unique(),
})

export type AccountSelect = typeof accounts.$inferSelect
export type AccountInsert = typeof accounts.$inferInsert
