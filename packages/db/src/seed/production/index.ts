import { productionSeedEnv } from '../../config/production-seed.env.ts'
import { seedDb, seedPool } from '../client.ts'
import { seedAdmin } from './admin.ts'
import { seedRoles } from './roles.ts'
import { seedDefaultTicketTypes } from './ticket-types.ts'

try {
  await seedRoles()
  await seedDefaultTicketTypes()
  await seedAdmin(seedDb, productionSeedEnv)
} finally {
  await seedPool.end()
}
