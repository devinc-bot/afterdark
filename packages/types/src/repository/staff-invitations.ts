import type { StaffInvitationSelect } from '@repo/db/schema'

export type StaffInvitationWithLocationRow = {
  invitation: StaffInvitationSelect
  locationDocumentId: string
  locationName: string
}
