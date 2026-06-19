import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { JwtPayload } from '@afterdark/types'
import { extractBearerToken } from '../utils/extract-bearer-token'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(JwtService) private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: { authorization?: string }; user?: JwtPayload }>()
    const token = extractBearerToken(request.headers.authorization)

    if (!token) {
      throw new UnauthorizedException()
    }

    try {
      request.user = await this.jwtService.verifyAsync<JwtPayload>(token)
      return true
    } catch {
      throw new UnauthorizedException()
    }
  }
}
