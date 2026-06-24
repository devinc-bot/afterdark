import { db } from '../client.ts'
import {
  staffInvitations,
  type StaffInvitationInsert,
  type StaffInvitationSelect,
} from '../schema/staff-invitation.ts'

export async function createStaffInvitation(
  input: StaffInvitationInsert
): Promise<StaffInvitationSelect> {
  const [invitation] = await db.insert(staffInvitations).values(input).returning()

  if (!invitation) {
    throw new Error('Staff invitation insert returned no row')
  }

  return invitation
}
