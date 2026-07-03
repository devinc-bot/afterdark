import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common'
import { USER_ROLE, type JwtPayload } from '@afterdark/types'
import { GUARD_ERROR_CODE } from '@afterdark/i18n/constants'
import { TranslationService } from '@afterdark/i18n/server'

@Injectable()
export class OwnerRoleGuard implements CanActivate {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>()
    const user = request.user

    if (!user || user.role !== USER_ROLE.OWNER) {
      throw new ForbiddenException(this.ts.translateError(GUARD_ERROR_CODE.OWNER_ONLY))
    }

    return true
  }
}
