import { seedRoles } from './roles.ts'
import { seedTicketsOrders } from './tickets-orders.ts'

await seedRoles()
await seedTicketsOrders()

console.log('[seed] completado')
process.exit(0)
