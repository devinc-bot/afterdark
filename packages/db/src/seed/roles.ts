import { eq } from 'drizzle-orm'
import { USER_ROLE } from '@afterdark/types'
import { db } from '../client.ts'
import { roles } from '../schema/role.ts'

const defaultRoles = [
  { name: USER_ROLE.OWNER, description: 'Club owner' },
  { name: USER_ROLE.ADMIN, description: 'Administrator' },
  { name: USER_ROLE.STAFF, description: 'Staff member' },
  { name: USER_ROLE.USER, description: 'Regular user' },
] as const

for (const role of defaultRoles) {
  const [existing] = await db.select().from(roles).where(eq(roles.name, role.name)).limit(1)

  if (!existing) {
    await db.insert(roles).values(role)
  }
}
