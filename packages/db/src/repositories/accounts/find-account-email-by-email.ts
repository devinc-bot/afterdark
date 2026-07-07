import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { accounts } from '../../schema/account.ts'

export async function findAccountEmailByEmail(email: string): Promise<string | null> {
  const [row] = await db
    .select({ email: accounts.email })
    .from(accounts)
    .where(eq(accounts.email, email))
    .limit(1)

  return row?.email ?? null
}
