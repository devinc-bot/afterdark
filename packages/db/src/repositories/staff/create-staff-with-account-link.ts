import type { Transaction } from '../../client.ts'
import { staff } from '../../schema/staff.ts'
import { staffAccountsLnk } from '../../schema/staff-account-lnk.ts'
import type { StaffProfileSeed } from '@afterdark/types'

export async function createStaffWithAccountLink(
  tx: Transaction,
  accountId: number,
  profile: StaffProfileSeed
): Promise<string> {
  const [staffMember] = await tx.insert(staff).values(profile).returning()

  if (!staffMember) {
    throw new Error('Staff insert returned no row')
  }

  await tx.insert(staffAccountsLnk).values({
    staffId: staffMember.id,
    accountId,
  })

  return staffMember.documentId
}
