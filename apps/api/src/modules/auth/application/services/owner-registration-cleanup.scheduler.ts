import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { deleteExpiredOwnerRegistrationTokens } from '@repo/db'

@Injectable()
export class OwnerRegistrationCleanupScheduler {
  private readonly logger = new Logger(OwnerRegistrationCleanupScheduler.name)

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const deleted = await deleteExpiredOwnerRegistrationTokens()
      if (deleted > 0) {
        this.logger.log(`Deleted ${deleted} expired owner registration token(s)`)
      }
    } catch (error) {
      this.logger.error('Owner registration token cleanup failed', error)
    }
  }
}
