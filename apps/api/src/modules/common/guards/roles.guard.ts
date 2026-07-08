import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { JwtPayload } from '@afterdark/types'
import { GUARD_ERROR_CODE } from '@afterdark/i18n/constants'
import { TranslationService } from '@afterdark/i18n/server'
import { Roles } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride(Roles, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!roles?.length) {
      return true
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>()
    const user = request.user

    if (!user || !(roles as readonly string[]).includes(user.role)) {
      throw new ForbiddenException(this.ts.translateError(GUARD_ERROR_CODE.INSUFFICIENT_ROLE))
    }

    return true
  }
}
