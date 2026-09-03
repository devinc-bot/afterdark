import { expect, test, vi } from 'vitest'
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

  expect(scheduler.getCutoff(new Date(2026, 2, 1, 12, 30))).toEqual(new Date(2026, 1, 1))
})

test('passes the calculated cutoff to the cleanup operation', async () => {
  const scheduler = new TestPendingOrderCleanupScheduler()

  await scheduler.cleanupStalePendingOrders()

  expect(scheduler.receivedCutoff).toBeTruthy()
  expect(scheduler.receivedCutoff!.getDate()).toBe(1)
  expect(scheduler.receivedCutoff!.getHours()).toBe(0)
  expect(scheduler.receivedCutoff!.getMinutes()).toBe(0)
  expect(scheduler.receivedCutoff!.getSeconds()).toBe(0)
  expect(scheduler.receivedCutoff!.getMilliseconds()).toBe(0)
})

test('logs cleanup failures without rejecting', async () => {
  const scheduler = new TestPendingOrderCleanupScheduler()
  const cleanupError = new Error('database unavailable')
  const loggedErrors: unknown[][] = []
  scheduler.cleanupError = cleanupError
  vi.spyOn(Logger.prototype, 'error').mockImplementation((...args: unknown[]) => {
    loggedErrors.push(args)
  })

  await scheduler.cleanupStalePendingOrders()

  expect(loggedErrors).toEqual([['Pending order cleanup failed', cleanupError]])
})
