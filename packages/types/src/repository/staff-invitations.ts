import type { StaffInvitationSelect } from '@repo/db/schema'

export type StaffInvitationWithOrganizationRow = {
  invitation: StaffInvitationSelect
  organizationDocumentId: string
  organizationName: string
}
