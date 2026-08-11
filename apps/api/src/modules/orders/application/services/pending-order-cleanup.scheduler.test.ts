import assert from 'node:assert/strict'
import test from 'node:test'
import { Logger } from '@nestjs/common'
import { PendingOrderCleanupScheduler } from './pending-order-cleanup.scheduler.ts'

class TestPendingOrderCleanupScheduler extends PendingOrderCleanupScheduler {
  deleted = 0
  receivedCutoff: Date | undefined
  cleanupError: Error | undefined

  getCutoff(now: Date): Date {
    return this.getPreviousMonthStart(now)
  }

  protected override async deleteStalePendingOrders(cutoff: Date): Promise<number> {
    this.receivedCutoff = cutoff
    if (this.cleanupError) throw this.cleanupError
    return this.deleted
  }
}

test('uses the first day of the preceding calendar month as the cutoff', () => {
  const scheduler = new TestPendingOrderCleanupScheduler()

  assert.deepEqual(scheduler.getCutoff(new Date(2026, 2, 1, 12, 30)), new Date(2026, 1, 1))
})

test('passes the calculated cutoff to the cleanup operation', async () => {
  const scheduler = new TestPendingOrderCleanupScheduler()

  await scheduler.cleanupStalePendingOrders()

  assert.ok(scheduler.receivedCutoff)
  assert.equal(scheduler.receivedCutoff.getDate(), 1)
  assert.equal(scheduler.receivedCutoff.getHours(), 0)
  assert.equal(scheduler.receivedCutoff.getMinutes(), 0)
  assert.equal(scheduler.receivedCutoff.getSeconds(), 0)
  assert.equal(scheduler.receivedCutoff.getMilliseconds(), 0)
})

test('logs cleanup failures without rejecting', async () => {
  const scheduler = new TestPendingOrderCleanupScheduler()
  const cleanupError = new Error('database unavailable')
  const originalError = Logger.prototype.error
  const loggedErrors: unknown[][] = []
  scheduler.cleanupError = cleanupError
  Logger.prototype.error = function (...args: unknown[]): void {
    loggedErrors.push(args)
  }

  try {
    await scheduler.cleanupStalePendingOrders()
  } finally {
    Logger.prototype.error = originalError
  }

  assert.deepEqual(loggedErrors, [['Pending order cleanup failed', cleanupError]])
})
