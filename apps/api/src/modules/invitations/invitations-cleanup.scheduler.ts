import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { deleteExpiredAndCancelledInvitations } from '@afterdark/db'

@Injectable()
export class InvitationsCleanupScheduler {
  private readonly logger = new Logger(InvitationsCleanupScheduler.name)

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupInvitations(): Promise<void> {
    try {
      await deleteExpiredAndCancelledInvitations()
    } catch (error) {
      this.logger.error('Cleanup failed', error)
    }
  }
}
