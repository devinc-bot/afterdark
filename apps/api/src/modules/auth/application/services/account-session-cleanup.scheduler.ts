import { Injectable, Logger } from '@nestjs/common'
import { Interval } from '@nestjs/schedule'
import { deleteExpiredOrRevokedAccountSessionsBefore } from '@repo/db'
import { runCleanupJob } from '../../../common'

const ACCOUNT_SESSION_RETENTION_DAYS = 7
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000
const ACCOUNT_SESSION_CLEANUP_INTERVAL_MILLISECONDS = 14 * DAY_IN_MILLISECONDS

@Injectable()
export class AccountSessionCleanupScheduler {
  private readonly logger = new Logger(AccountSessionCleanupScheduler.name)

  @Interval(ACCOUNT_SESSION_CLEANUP_INTERVAL_MILLISECONDS)
  async cleanupExpiredOrRevokedSessions(): Promise<void> {
    await runCleanupJob({
      logger: this.logger,
      failureMessage: 'Account session cleanup failed',
      successMessage: (deleted) => `Deleted ${deleted} expired or revoked account session(s)`,
      run: () => this.deleteExpiredOrRevokedSessions(this.getRetentionCutoff(new Date())),
    })
  }

  protected getRetentionCutoff(now: Date): Date {
    return new Date(now.getTime() - ACCOUNT_SESSION_RETENTION_DAYS * DAY_IN_MILLISECONDS)
  }

  protected deleteExpiredOrRevokedSessions(cutoff: Date): Promise<number> {
    return deleteExpiredOrRevokedAccountSessionsBefore(cutoff)
  }
}
