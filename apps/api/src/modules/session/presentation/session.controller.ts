import { Controller, Get, Inject, UseGuards } from '@nestjs/common'
import { API_ROUTES } from '@repo/common'
import type { JwtPayload, SessionResponse } from '@repo/types'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { GetCurrentSessionUseCase } from '../application/get-current-session.use-case'

@Controller(API_ROUTES.session.prefix)
export class SessionController {
  constructor(
    @Inject(GetCurrentSessionUseCase)
    private readonly getCurrentSessionUseCase: GetCurrentSessionUseCase
  ) {}

  @Get(API_ROUTES.session.path.me())
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: JwtPayload): Promise<SessionResponse> {
    return this.getCurrentSessionUseCase.execute(user)
  }
}
