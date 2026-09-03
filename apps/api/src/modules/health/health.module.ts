import { Module } from '@nestjs/common'
import { CheckApiReadinessUseCase } from './application/check-api-readiness.use-case'
import { HealthController } from './presentation/health.controller'

@Module({
  controllers: [HealthController],
  providers: [CheckApiReadinessUseCase],
})
export class HealthModule {}
