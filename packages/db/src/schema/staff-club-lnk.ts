import { integer, sqliteTable, unique } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'
import { staff } from './staff.ts'
import { clubs } from './club.ts'

export const staffClubsLnk = sqliteTable(
  'staff_club_lnk',
  {
    ...createBaseColumns('staff_club_lnk'),
    staffId: integer('staff_id')
      .notNull()
      .references(() => staff.id),
    clubId: integer('club_id')
      .notNull()
      .references(() => clubs.id),
  },
  (t) => [unique('staff_club_lnk_unique').on(t.staffId, t.clubId)]
)

export type StaffClubLnkSelect = typeof staffClubsLnk.$inferSelect
export type StaffClubLnkInsert = typeof staffClubsLnk.$inferInsert
