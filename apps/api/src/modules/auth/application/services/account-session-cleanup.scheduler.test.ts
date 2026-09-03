import { expect, test, vi } from 'vitest'
import { Logger } from '@nestjs/common'
import { AccountSessionCleanupScheduler } from './account-session-cleanup.scheduler.ts'

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000
const TWO_WEEKS_IN_MILLISECONDS = 14 * DAY_IN_MILLISECONDS

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

test('uses a cutoff exactly 7 days before cleanup runs', () => {
  const scheduler = new TestAccountSessionCleanupScheduler()

  expect(scheduler.getCutoff(new Date('2026-03-31T12:30:00.000Z'))).toEqual(
    new Date('2026-03-24T12:30:00.000Z')
  )
})

test('schedules cleanup at a true two-week interval instead of an inexact calendar cron', () => {
  const cleanup = AccountSessionCleanupScheduler.prototype.cleanupExpiredOrRevokedSessions

  expect(Reflect.getMetadata('SCHEDULE_INTERVAL_OPTIONS', cleanup)).toEqual({
    timeout: TWO_WEEKS_IN_MILLISECONDS,
  })
  expect(Reflect.getMetadata('SCHEDULE_CRON_OPTIONS', cleanup)).toBeUndefined()
})

test('passes the 7-day retention cutoff to session cleanup', async () => {
  const scheduler = new TestAccountSessionCleanupScheduler()
  const now = new Date('2026-09-02T15:00:00.000Z')
  vi.useFakeTimers()
  vi.setSystemTime(now)

  try {
    await scheduler.cleanupExpiredOrRevokedSessions()

    expect(scheduler.receivedCutoff).toEqual(new Date(now.getTime() - 7 * DAY_IN_MILLISECONDS))
  } finally {
    vi.useRealTimers()
  }
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
