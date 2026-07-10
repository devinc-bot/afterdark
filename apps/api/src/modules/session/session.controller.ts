import { Controller, Get, Inject, UseGuards } from '@nestjs/common'
import type { JwtPayload, SessionResponse } from '@afterdark/types'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { SessionService } from './session.service'
import { API_ROUTES } from '@afterdark/common'

@Controller(API_ROUTES.session.prefix)
export class SessionController {
  constructor(@Inject(SessionService) private readonly sessionService: SessionService) {}

  @Get(API_ROUTES.session.path.me())
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: JwtPayload): Promise<SessionResponse> {
    return this.sessionService.getCurrentSession(user)
  }
}
