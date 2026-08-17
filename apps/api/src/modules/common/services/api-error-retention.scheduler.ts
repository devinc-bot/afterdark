import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { deleteApiErrorRecordsBefore } from '@repo/db'

const API_ERROR_RETENTION_DAYS = 30

@Injectable()
export class ApiErrorRetentionScheduler {
  private readonly logger = new Logger(ApiErrorRetentionScheduler.name)

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredRecords(): Promise<void> {
    try {
      const deleted = await this.deleteApiErrorRecordsBefore(this.getCutoff(new Date()))
      if (deleted > 0) {
        this.logger.log(`Deleted ${deleted} expired API error record(s)`)
      }
    } catch (error) {
      this.logger.error('API error record cleanup failed', error)
    }
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
