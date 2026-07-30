import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { STAFF_STATUS } from '@repo/types/enums'
import { createBaseColumns } from './base.ts'
import { assets } from './asset.ts'

export const staff = sqliteTable('staff', {
  ...createBaseColumns('staff'),
  name: text('name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone').notNull(),
  avatarId: integer('avatar_id').references(() => assets.id, { onDelete: 'set null' }),
  status: text('status', {
    enum: [STAFF_STATUS.ACTIVE, STAFF_STATUS.INACTIVE],
  })
    .notNull()
    .default(STAFF_STATUS.ACTIVE),
})

export type StaffSelect = typeof staff.$inferSelect
export type StaffInsert = typeof staff.$inferInsert
