import { seedEnv } from '../config/seed.env.ts'
import { db } from '../client.ts'
import { seedAdmin } from './admin.ts'
import { seedRoles } from './roles.ts'
import { seedTicketsOrders } from './tickets-orders.ts'

await seedRoles()
await seedAdmin(db, seedEnv)
await seedTicketsOrders()

process.exit(0)
