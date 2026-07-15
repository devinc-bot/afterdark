import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { deleteExpiredPasswordResetTokens } from '@afterdark/db'

@Injectable()
export class PasswordResetCleanupScheduler {
  private readonly logger = new Logger(PasswordResetCleanupScheduler.name)

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const deleted = await deleteExpiredPasswordResetTokens()
      if (deleted > 0) {
        this.logger.log(`Deleted ${deleted} expired password reset token(s)`)
      }
    } catch (error) {
      this.logger.error('Password reset token cleanup failed', error)
    }
  }
}
