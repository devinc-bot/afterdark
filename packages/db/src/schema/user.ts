import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { USER_ROLE } from '@afterdark/types'
import { baseColumns } from './base.ts'

export const users = sqliteTable('users', {
  ...baseColumns,
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: [USER_ROLE.ADMIN, USER_ROLE.STAFF] })
    .notNull()
    .default(USER_ROLE.STAFF),
})

export type UserSelect = typeof users.$inferSelect
export type UserInsert = typeof users.$inferInsert
