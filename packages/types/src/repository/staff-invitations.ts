import type { StaffInvitationSelect } from '@afterdark/db/schema'

export type StaffInvitationWithClubRow = {
  invitation: StaffInvitationSelect
  clubDocumentId: string
  clubName: string
}
