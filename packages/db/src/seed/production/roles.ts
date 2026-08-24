import { eq } from 'drizzle-orm'
import { USER_ROLE } from '@repo/types'
import { roles } from '../../schema/role.ts'
import { seedDb as db } from '../client.ts'

const defaultRoles = [
  { name: USER_ROLE.OWNER, description: 'Location owner' },
  { name: USER_ROLE.ADMIN, description: 'Administrator' },
  { name: USER_ROLE.STAFF, description: 'Staff member' },
  { name: USER_ROLE.USER, description: 'Regular user' },
] as const

export async function seedRoles(): Promise<void> {
  for (const role of defaultRoles) {
    const [existing] = await db.select().from(roles).where(eq(roles.name, role.name)).limit(1)

    if (!existing) {
      await db.insert(roles).values(role)
    }
  }
}
