import { Injectable, Logger } from '@nestjs/common'
import { Interval } from '@nestjs/schedule'
import { deleteExpiredOrRevokedAccountSessionsBefore } from '@repo/db'

const ACCOUNT_SESSION_RETENTION_DAYS = 7
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000
const ACCOUNT_SESSION_CLEANUP_INTERVAL_MILLISECONDS = 14 * DAY_IN_MILLISECONDS

@Injectable()
export class AccountSessionCleanupScheduler {
  private readonly logger = new Logger(AccountSessionCleanupScheduler.name)

  @Interval(ACCOUNT_SESSION_CLEANUP_INTERVAL_MILLISECONDS)
  async cleanupExpiredOrRevokedSessions(): Promise<void> {
    try {
      const deleted = await this.deleteExpiredOrRevokedSessions(this.getRetentionCutoff(new Date()))
      if (deleted > 0) {
        this.logger.log(`Deleted ${deleted} expired or revoked account session(s)`)
      }
    } catch (error) {
      this.logger.error('Account session cleanup failed', error)
    }
  }

  protected getRetentionCutoff(now: Date): Date {
    return new Date(now.getTime() - ACCOUNT_SESSION_RETENTION_DAYS * DAY_IN_MILLISECONDS)
  }

  protected deleteExpiredOrRevokedSessions(cutoff: Date): Promise<number> {
    return deleteExpiredOrRevokedAccountSessionsBefore(cutoff)
  }
}
