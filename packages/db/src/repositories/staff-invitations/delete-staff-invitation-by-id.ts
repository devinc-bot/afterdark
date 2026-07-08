import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { staffInvitations } from '../../schema/staff-invitation.ts'

export async function deleteStaffInvitationById(id: number): Promise<void> {
  await db.delete(staffInvitations).where(eq(staffInvitations.id, id))
}
