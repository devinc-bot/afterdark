import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { accounts, type AccountSelect } from '../../schema/account.ts'

export async function findAccountByEmail(email: string): Promise<AccountSelect | null> {
  const [account] = await db.select().from(accounts).where(eq(accounts.email, email)).limit(1)

  return account ?? null
}
