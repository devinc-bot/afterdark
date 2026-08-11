import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { deleteStalePendingOrders } from '@repo/db'

@Injectable()
export class PendingOrderCleanupScheduler {
  private readonly logger = new Logger(PendingOrderCleanupScheduler.name)

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async cleanupStalePendingOrders(): Promise<void> {
    try {
      const cutoff = this.getPreviousMonthStart(new Date())

      const deleted = await this.deleteStalePendingOrders(cutoff)
      if (deleted > 0) {
        this.logger.log(`Deleted ${deleted} stale pending order(s)`)
      }
    } catch (error) {
      this.logger.error('Pending order cleanup failed', error)
    }
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
