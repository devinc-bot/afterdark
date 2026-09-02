import { expect, test, vi } from 'vitest'
import { Logger } from '@nestjs/common'
import { AccountSessionCleanupScheduler } from './account-session-cleanup.scheduler.ts'

class TestAccountSessionCleanupScheduler extends AccountSessionCleanupScheduler {
  deleted = 0
  receivedCutoff: Date | undefined
  cleanupError: Error | undefined

  getCutoff(now: Date): Date {
    return this.getRetentionCutoff(now)
  }

  protected override async deleteExpiredOrRevokedSessions(cutoff: Date): Promise<number> {
    this.receivedCutoff = cutoff
    if (this.cleanupError) throw this.cleanupError
    return this.deleted
  }
}

test('uses a cutoff exactly 30 days before cleanup runs', () => {
  const scheduler = new TestAccountSessionCleanupScheduler()

  expect(scheduler.getCutoff(new Date('2026-03-31T12:30:00.000Z'))).toEqual(
    new Date('2026-03-01T12:30:00.000Z')
  )
})

test('passes the 30-day retention cutoff to session cleanup', async () => {
  const scheduler = new TestAccountSessionCleanupScheduler()

  await scheduler.cleanupExpiredOrRevokedSessions()

  expect(scheduler.receivedCutoff).toBeTruthy()
  expect(scheduler.receivedCutoff!.getTime()).toBeLessThanOrEqual(Date.now())
  expect(scheduler.receivedCutoff!.getTime()).toBeGreaterThan(Date.now() - 31 * 24 * 60 * 60 * 1000)
})

test('logs cleanup failures without rejecting', async () => {
  const scheduler = new TestAccountSessionCleanupScheduler()
  const cleanupError = new Error('database unavailable')
  const loggedErrors: unknown[][] = []
  scheduler.cleanupError = cleanupError
  vi.spyOn(Logger.prototype, 'error').mockImplementation((...args: unknown[]) => {
    loggedErrors.push(args)
  })

  await scheduler.cleanupExpiredOrRevokedSessions()

  expect(loggedErrors).toEqual([['Account session cleanup failed', cleanupError]])
})
