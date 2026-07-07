import { findAccountIdByEmail } from './find-account-id-by-email.ts'

export async function accountExistsByEmail(email: string): Promise<boolean> {
  const id = await findAccountIdByEmail(email)
  return id !== null
}
