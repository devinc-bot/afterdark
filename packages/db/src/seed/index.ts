import { seedRoles } from './roles.ts'
import { seedTicketsOrders } from './tickets-orders.ts'

await seedRoles()
await seedTicketsOrders()

process.exit(0)
