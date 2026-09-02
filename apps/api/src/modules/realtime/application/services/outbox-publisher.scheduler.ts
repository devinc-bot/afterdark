import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { publishDomainOutboxEvents } from '@repo/db'

const OUTBOX_PUBLISH_BATCH_SIZE = 100

/** Marks committed PostgreSQL outbox rows delivered; streams read them durably for every instance. */
@Injectable()
export class OutboxPublisherScheduler {
  private readonly logger = new Logger(OutboxPublisherScheduler.name)

  @Cron(CronExpression.EVERY_10_SECONDS)
  async publish(): Promise<void> {
    try {
      await publishDomainOutboxEvents(new Date(), OUTBOX_PUBLISH_BATCH_SIZE)
    } catch (error) {
      this.logger.error('Domain outbox publication failed', error)
    }
  }
}
