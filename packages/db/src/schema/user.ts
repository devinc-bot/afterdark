import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { USER_STATUS } from '@repo/types/enums'
import { createBaseColumns } from './base.ts'
import { assets } from './asset.ts'

export const users = pgTable('users', {
  ...createBaseColumns('users'),
  name: text('name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone').notNull(),
  avatarId: integer('avatar_id').references(() => assets.id, { onDelete: 'set null' }),
  birthday: text('birthday'),
  nationalId: text('national_id'),
  status: text('status', {
    enum: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.PRIVATE],
  })
    .notNull()
    .default(USER_STATUS.ACTIVE),
})

export type UserSelect = typeof users.$inferSelect
export type UserInsert = typeof users.$inferInsert
