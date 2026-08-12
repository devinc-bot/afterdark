import assert from 'node:assert/strict'
import test from 'node:test'
import { Logger } from '@nestjs/common'
import { ApiErrorRetentionScheduler } from './api-error-retention.scheduler.ts'

class TestApiErrorRetentionScheduler extends ApiErrorRetentionScheduler {
  receivedCutoff: Date | undefined
  cleanupError: Error | undefined

  getRetentionCutoff(now: Date): Date {
    return this.getCutoff(now)
  }

  protected override async deleteApiErrorRecordsBefore(cutoff: Date): Promise<number> {
    this.receivedCutoff = cutoff
    if (this.cleanupError) throw this.cleanupError
    return 0
  }
}

test('uses a cutoff exactly 30 days before cleanup', () => {
  const scheduler = new TestApiErrorRetentionScheduler()
  const now = new Date(2026, 2, 31, 12, 30)

  assert.deepEqual(scheduler.getRetentionCutoff(now), new Date(2026, 2, 1, 12, 30))
})

test('passes the 30-day cutoff to the repository', async () => {
  const scheduler = new TestApiErrorRetentionScheduler()

  await scheduler.cleanupExpiredRecords()

  assert.ok(scheduler.receivedCutoff)
  const ageInMilliseconds = Date.now() - scheduler.receivedCutoff.getTime()
  assert.ok(ageInMilliseconds >= 30 * 24 * 60 * 60 * 1000)
  assert.ok(ageInMilliseconds < 30 * 24 * 60 * 60 * 1000 + 1000)
})

test('logs cleanup failures without rejecting', async () => {
  const scheduler = new TestApiErrorRetentionScheduler()
  const cleanupError = new Error('database unavailable')
  const originalError = Logger.prototype.error
  const loggedErrors: unknown[][] = []
  scheduler.cleanupError = cleanupError
  Logger.prototype.error = function (...args: unknown[]): void {
    loggedErrors.push(args)
  }

  try {
    await scheduler.cleanupExpiredRecords()
  } finally {
    Logger.prototype.error = originalError
  }

  assert.deepEqual(loggedErrors, [['API error record cleanup failed', cleanupError]])
})
