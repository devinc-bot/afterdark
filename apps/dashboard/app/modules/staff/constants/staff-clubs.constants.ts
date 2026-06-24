export const STAFF_CLUB_OPTIONS = [
  { id: 'neon_lounge', label: 'Neon Lounge' },
  { id: 'cyber_disco', label: 'Cyber Disco' },
  { id: 'underground_hub', label: 'Underground Hub' },
] as const

export type StaffClubOption = (typeof STAFF_CLUB_OPTIONS)[number]

export function getStaffClubLabel(clubId: string): string {
  return STAFF_CLUB_OPTIONS.find((club) => club.id === clubId)?.label ?? clubId
}
