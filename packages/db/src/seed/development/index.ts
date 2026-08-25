import { seedEnv } from '../../config/seed.env.ts'
import { seedDb, seedPool } from '../client.ts'
import { seedAdmin } from '../production/admin.ts'
import { seedRoles } from '../production/roles.ts'
import { seedTicketsOrders } from './tickets-orders.ts'

try {
  await seedRoles()
  await seedAdmin(seedDb, seedEnv)
  await seedTicketsOrders()
} finally {
  await seedPool.end()
}
