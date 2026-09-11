import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { deleteExpiredOwnerRegistrationTokens } from '@repo/db'
import { runCleanupJob } from '../../../common'

@Injectable()
export class OwnerRegistrationCleanupScheduler {
  private readonly logger = new Logger(OwnerRegistrationCleanupScheduler.name)

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredTokens(): Promise<void> {
    await runCleanupJob({
      logger: this.logger,
      failureMessage: 'Owner registration token cleanup failed',
      successMessage: (deleted) => `Deleted ${deleted} expired owner registration token(s)`,
      run: () => deleteExpiredOwnerRegistrationTokens(),
    })
  }
}
