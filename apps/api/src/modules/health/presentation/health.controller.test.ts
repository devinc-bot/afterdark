import { ServiceUnavailableException } from '@nestjs/common'
import { expect, test, vi } from 'vitest'

const state = vi.hoisted(() => ({ databaseAvailable: true }))

vi.mock('@repo/db', () => ({
  checkDatabaseConnection: async () => {
    if (!state.databaseAvailable) {
      throw new Error('Database unavailable')
    }
  },
}))

import { CheckApiReadinessUseCase } from '../application/check-api-readiness.use-case.ts'
import { HealthController } from './health.controller.ts'

function createController() {
  return new HealthController(new CheckApiReadinessUseCase())
}

test('returns liveness without a database query', () => {
  state.databaseAvailable = false
  const controller = createController()

  expect(controller.check()).toEqual({ status: 'ok' })
})

test('returns readiness when the database is reachable', async () => {
  state.databaseAvailable = true
  const controller = createController()

  await expect(controller.ready()).resolves.toEqual({ status: 'ok' })
})

test('returns service unavailable when the database is unreachable', async () => {
  state.databaseAvailable = false
  const controller = createController()

  await expect(controller.ready()).rejects.toBeInstanceOf(ServiceUnavailableException)
})
