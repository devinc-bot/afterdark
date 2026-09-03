import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  UseGuards,
} from '@nestjs/common'
import { API_ROUTES } from '@repo/common'
import type { AccountSessionsResponse, JwtPayload, SessionResponse } from '@repo/types'
import { uuidSchema } from '@repo/validators'
import { CLIENT_APP_BY_USER_ROLE } from '../../auth/auth.constants'
import { ApiRateLimit } from '../../common/decorators/api-rate-limit.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RATE_LIMIT_PROFILE } from '../../../config/rate-limit.policy'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { GetCurrentSessionUseCase } from '../application/get-current-session.use-case'
import { ListAccountSessionsUseCase } from '../application/list-account-sessions.use-case'
import { RevokeAccountSessionUseCase } from '../application/revoke-account-session.use-case'

@Controller(API_ROUTES.session.prefix)
@ApiRateLimit(RATE_LIMIT_PROFILE.AUTHENTICATED)
export class SessionController {
  constructor(
    @Inject(GetCurrentSessionUseCase)
    private readonly getCurrentSessionUseCase: GetCurrentSessionUseCase,
    @Inject(ListAccountSessionsUseCase)
    private readonly listAccountSessions: ListAccountSessionsUseCase,
    @Inject(RevokeAccountSessionUseCase)
    private readonly revokeAccountSession: RevokeAccountSessionUseCase
  ) {}

  @Get(API_ROUTES.session.path.me())
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: JwtPayload): Promise<SessionResponse> {
    return this.getCurrentSessionUseCase.execute(user)
  }

  @Get(API_ROUTES.session.path.list())
  @UseGuards(JwtAuthGuard)
  list(@CurrentUser() user: JwtPayload): Promise<AccountSessionsResponse> {
    return this.listAccountSessions.execute(user, CLIENT_APP_BY_USER_ROLE[user.role])
  }

  @Delete(API_ROUTES.session.path.revoke(':documentId'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  revoke(
    @CurrentUser() user: JwtPayload,
    @Param('documentId', new ZodValidationPipe(uuidSchema)) documentId: string
  ): Promise<void> {
    return this.revokeAccountSession.execute(user, CLIENT_APP_BY_USER_ROLE[user.role], documentId)
  }
}
