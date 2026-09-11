import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { deleteExpiredUserRegistrationTokens } from '@repo/db'
import { runCleanupJob } from '../../../common'

@Injectable()
export class UserRegistrationCleanupScheduler {
  private readonly logger = new Logger(UserRegistrationCleanupScheduler.name)

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredTokens(): Promise<void> {
    await runCleanupJob({
      logger: this.logger,
      failureMessage: 'User registration token cleanup failed',
      successMessage: (deleted) => `Deleted ${deleted} expired user registration token(s)`,
      run: () => deleteExpiredUserRegistrationTokens(),
    })
  }
}
