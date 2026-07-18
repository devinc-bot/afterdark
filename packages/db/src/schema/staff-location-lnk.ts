import { integer, sqliteTable, unique } from 'drizzle-orm/sqlite-core'
import { createBaseColumns } from './base.ts'
import { staff } from './staff.ts'
import { locations } from './location.ts'

export const staffLocationsLnk = sqliteTable(
  'staff_location_lnk',
  {
    ...createBaseColumns('staff_location_lnk'),
    staffId: integer('staff_id')
      .notNull()
      .references(() => staff.id),
    locationId: integer('location_id')
      .notNull()
      .references(() => locations.id),
  },
  (t) => [unique('staff_location_lnk_unique').on(t.staffId, t.locationId)]
)

export type StaffLocationLnkSelect = typeof staffLocationsLnk.$inferSelect
export type StaffLocationLnkInsert = typeof staffLocationsLnk.$inferInsert
