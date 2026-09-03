import { Module } from '@nestjs/common'
import { OutboxPublisherScheduler } from './application/services/outbox-publisher.scheduler'
import { SseStreamsService } from './application/services/sse-streams.service'

@Module({
  providers: [OutboxPublisherScheduler, SseStreamsService],
  exports: [SseStreamsService],
})
export class RealtimeModule {}
