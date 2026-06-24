import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { USER_ROLE, type JwtPayload } from '@afterdark/types'
import { GUARD_MESSAGE } from '../constants/guard.constants'

@Injectable()
export class OwnerRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>()
    const user = request.user

    if (!user || user.role !== USER_ROLE.OWNER) {
      throw new ForbiddenException(GUARD_MESSAGE.OWNER_ONLY)
    }

    return true
  }
}
