import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { USER_STATUS } from '@afterdark/types'
import { baseColumns } from './base.ts'

export const users = sqliteTable('users', {
  ...baseColumns,
  name: text('name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone').notNull(),
  avatar: text('avatar'),
  age: integer('age'),
  status: text('status', {
    enum: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.PRIVATE],
  })
    .notNull()
    .default(USER_STATUS.ACTIVE),
})

export type UserSelect = typeof users.$inferSelect
export type UserInsert = typeof users.$inferInsert
