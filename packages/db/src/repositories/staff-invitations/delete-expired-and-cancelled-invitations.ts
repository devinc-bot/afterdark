import { inArray, lt, or } from 'drizzle-orm'
import { STAFF_INVITATION_STATUS } from '@repo/types'
import { db } from '../../client.ts'
import { staffInvitations } from '../../schema/staff-invitation.ts'

export async function deleteExpiredAndCancelledInvitations(): Promise<void> {
  await db
    .delete(staffInvitations)
    .where(
      or(
        lt(staffInvitations.expiresAt, new Date()),
        inArray(staffInvitations.status, [
          STAFF_INVITATION_STATUS.EXPIRED,
          STAFF_INVITATION_STATUS.CANCELLED,
        ])
      )
    )
}
