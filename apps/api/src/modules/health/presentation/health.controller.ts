import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { API_ROUTES } from '@repo/common'
import { CheckApiReadinessUseCase } from '../application/check-api-readiness.use-case'

@Controller(API_ROUTES.health.prefix)
@SkipThrottle()
export class HealthController {
  constructor(private readonly checkApiReadinessUseCase: CheckApiReadinessUseCase) {}

  @Get(API_ROUTES.health.path.root())
  check() {
    return { status: 'ok' }
  }

  @Get(API_ROUTES.health.path.ready())
  async ready() {
    try {
      return await this.checkApiReadinessUseCase.execute()
    } catch {
      throw new ServiceUnavailableException()
    }
  }
}
