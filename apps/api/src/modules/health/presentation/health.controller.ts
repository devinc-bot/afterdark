import { Controller, Get } from '@nestjs/common'
import { API_ROUTES } from '@afterdark/common'

@Controller(API_ROUTES.health.prefix)
export class HealthController {
  @Get(API_ROUTES.health.path.root())
  check() {
    return { status: 'ok' }
  }
}
