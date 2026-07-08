import { db, type Transaction } from '../../client.ts'
import { accounts } from '../../schema/account.ts'
import { accountRolesLnk } from '../../schema/account-role-lnk.ts'
import { createProfileForRole } from './create-profile-for-role.ts'
import type { RegisterAccountInput } from '@afterdark/types'

export async function registerAccount(input: RegisterAccountInput): Promise<void> {
  await db.transaction(async (tx: Transaction) => {
    const [account] = await tx
      .insert(accounts)
      .values({
        email: input.email,
        password: input.hashedPassword,
      })
      .returning()

    if (!account) {
      throw new Error('Account insert returned no row')
    }

    await createProfileForRole(tx, account.id, input.roleName, input.profile)

    await tx.insert(accountRolesLnk).values({
      accountId: account.id,
      roleId: input.roleId,
    })
  })
}
