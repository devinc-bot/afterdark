import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { OWNER_STATUS } from '@repo/types/enums'
import { createBaseColumns } from './base.ts'
import { assets } from './asset.ts'

export const owners = sqliteTable('owners', {
  ...createBaseColumns('owners'),
  name: text('name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone').notNull(),
  avatarId: integer('avatar_id').references(() => assets.id, { onDelete: 'set null' }),
  birthday: text('birthday'),
  nationalId: text('national_id'),
  organizationName: text('organization_name'),
  taxId: text('tax_id'),
  status: text('status', {
    enum: [OWNER_STATUS.ACTIVE, OWNER_STATUS.INACTIVE, OWNER_STATUS.PENDING],
  })
    .notNull()
    .default(OWNER_STATUS.ACTIVE),
})

export type OwnerSelect = typeof owners.$inferSelect
export type OwnerInsert = typeof owners.$inferInsert
