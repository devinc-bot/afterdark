import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { USER_STATUS } from '@afterdark/types'
import { createBaseColumns } from './base.ts'

export const users = sqliteTable('users', {
  ...createBaseColumns('users'),
  name: text('name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone').notNull(),
  avatar: text('avatar'),
  birthday: text('birthday'),
  nationalId: text('national_id'),
  taxId: text('tax_id'),
  address: text('address'),
  status: text('status', {
    enum: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.PRIVATE],
  })
    .notNull()
    .default(USER_STATUS.ACTIVE),
})

export type UserSelect = typeof users.$inferSelect
export type UserInsert = typeof users.$inferInsert
