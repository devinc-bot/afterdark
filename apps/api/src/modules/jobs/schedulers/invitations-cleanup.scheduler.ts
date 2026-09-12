import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { deleteExpiredAndCancelledInvitations } from '@repo/db'
import { runCleanupJob } from '../run-cleanup-job'

@Injectable()
export class InvitationsCleanupScheduler {
  private readonly logger = new Logger(InvitationsCleanupScheduler.name)

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupInvitations(): Promise<void> {
    await runCleanupJob({
      logger: this.logger,
      failureMessage: 'Cleanup failed',
      run: () => deleteExpiredAndCancelledInvitations(),
    })
  }
}
