import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { deleteExpiredUserRegistrationTokens } from '@repo/db'

@Injectable()
export class UserRegistrationCleanupScheduler {
  private readonly logger = new Logger(UserRegistrationCleanupScheduler.name)

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const deleted = await deleteExpiredUserRegistrationTokens()
      if (deleted > 0) {
        this.logger.log(`Deleted ${deleted} expired user registration token(s)`)
      }
    } catch (error) {
      this.logger.error('User registration token cleanup failed', error)
    }
  }
}
