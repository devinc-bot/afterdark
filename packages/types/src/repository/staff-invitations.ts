import type { StaffInvitationSelect } from '@afterdark/db/schema'

export type StaffInvitationWithLocationRow = {
  invitation: StaffInvitationSelect
  locationDocumentId: string
  locationName: string
}
