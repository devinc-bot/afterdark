import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { deleteApiErrorRecordsBefore } from '@repo/db'
import { runCleanupJob } from './run-cleanup-job'

const API_ERROR_RETENTION_DAYS = 30

@Injectable()
export class ApiErrorRetentionScheduler {
  private readonly logger = new Logger(ApiErrorRetentionScheduler.name)

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredRecords(): Promise<void> {
    await runCleanupJob({
      logger: this.logger,
      failureMessage: 'API error record cleanup failed',
      successMessage: (deleted) => `Deleted ${deleted} expired API error record(s)`,
      run: () => this.deleteApiErrorRecordsBefore(this.getCutoff(new Date())),
    })
  }

  protected getCutoff(now: Date): Date {
    const cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() - API_ERROR_RETENTION_DAYS)
    return cutoff
  }

  protected deleteApiErrorRecordsBefore(cutoff: Date): Promise<number> {
    return deleteApiErrorRecordsBefore(cutoff)
  }
}
