import assert from 'node:assert/strict'
import { mock, test } from 'node:test'
import { ServiceUnavailableException } from '@nestjs/common'

let databaseAvailable = true

mock.module('@repo/db', {
  namedExports: {
    checkDatabaseConnection: async () => {
      if (!databaseAvailable) {
        throw new Error('Database unavailable')
      }
    },
  },
})

const healthModulePromise = Promise.all([
  import('../application/check-api-readiness.use-case.ts'),
  import('./health.controller.ts'),
])

async function createController() {
  const [{ CheckApiReadinessUseCase }, { HealthController }] = await healthModulePromise
  return new HealthController(new CheckApiReadinessUseCase())
}

test('returns liveness without a database query', async () => {
  databaseAvailable = false
  const controller = await createController()

  assert.deepEqual(controller.check(), { status: 'ok' })
})

test('returns readiness when the database is reachable', async () => {
  databaseAvailable = true
  const controller = await createController()

  assert.deepEqual(await controller.ready(), { status: 'ok' })
})

test('returns service unavailable when the database is unreachable', async () => {
  databaseAvailable = false
  const controller = await createController()

  await assert.rejects(controller.ready(), ServiceUnavailableException)
})
