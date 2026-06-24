import type { StaffUserRecord } from '~/modules/staff/types/staff-user-record'

function normalizeSearchValue(value: string): string {
  return value.trim().toLocaleLowerCase('es-AR')
}

export function searchStaffUserRecords(
  records: StaffUserRecord[],
  searchQuery: string
): StaffUserRecord[] {
  const normalizedQuery = normalizeSearchValue(searchQuery)
  if (!normalizedQuery) return records

  return records.filter((record) => {
    const name = record.name.toLocaleLowerCase('es-AR')
    const email = record.email.toLocaleLowerCase('es-AR')

    return name.includes(normalizedQuery) || email.includes(normalizedQuery)
  })
}

export function hasActiveStaffUserSearch(searchQuery: string): boolean {
  return normalizeSearchValue(searchQuery).length > 0
}
