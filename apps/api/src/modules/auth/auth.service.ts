import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db, users } from '@afterdark/db'
import type { LoginInput } from '@afterdark/validators'
import { AUTH_MESSAGE } from './auth.constants'

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(input: LoginInput) {
    const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1)

    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGE.INVALID_CREDENTIALS)
    }

    const passwordMatches = await compare(input.password, user.password)

    if (!passwordMatches) {
      throw new UnauthorizedException(AUTH_MESSAGE.INVALID_CREDENTIALS)
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
  }
}
