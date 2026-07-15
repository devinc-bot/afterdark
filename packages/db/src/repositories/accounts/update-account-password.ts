import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'

export async function updateAccountPassword(
  accountId: number,
  hashedPassword: string
): Promise<void> {
  await db
    .update(accounts)
    .set({ password: hashedPassword, updatedAt: new Date() })
    .where(eq(accounts.id, accountId))
}
