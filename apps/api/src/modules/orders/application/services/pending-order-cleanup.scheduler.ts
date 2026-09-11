import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { deleteStalePendingOrders } from '@repo/db'
import { runCleanupJob } from '../../../common'

@Injectable()
export class PendingOrderCleanupScheduler {
  private readonly logger = new Logger(PendingOrderCleanupScheduler.name)

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async cleanupStalePendingOrders(): Promise<void> {
    await runCleanupJob({
      logger: this.logger,
      failureMessage: 'Pending order cleanup failed',
      successMessage: (deleted) => `Deleted ${deleted} stale pending order(s)`,
      run: () => this.deleteStalePendingOrders(this.getPreviousMonthStart(new Date())),
    })
  }

  protected getPreviousMonthStart(now: Date): Date {
    const cutoff = new Date(now)
    cutoff.setMonth(cutoff.getMonth() - 1, 1)
    cutoff.setHours(0, 0, 0, 0)
    return cutoff
  }

  protected deleteStalePendingOrders(cutoff: Date): Promise<number> {
    return deleteStalePendingOrders(cutoff)
  }
}
