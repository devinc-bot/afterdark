import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { deleteExpiredPasswordResetTokens } from '@repo/db'
import { runCleanupJob } from '../run-cleanup-job'

@Injectable()
export class PasswordResetCleanupScheduler {
  private readonly logger = new Logger(PasswordResetCleanupScheduler.name)

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredTokens(): Promise<void> {
    await runCleanupJob({
      logger: this.logger,
      failureMessage: 'Password reset token cleanup failed',
      successMessage: (deleted) => `Deleted ${deleted} expired password reset token(s)`,
      run: () => deleteExpiredPasswordResetTokens(),
    })
  }
}
