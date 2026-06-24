import { eq } from 'drizzle-orm'
import { db } from '../client.ts'
import { roles, type RoleSelect } from '../schema/role.ts'

export async function findRoleByName(name: string): Promise<RoleSelect | null> {
  const [role] = await db.select().from(roles).where(eq(roles.name, name)).limit(1)

  return role ?? null
}
