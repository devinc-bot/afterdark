import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { randomBytes } from 'node:crypto'
import {
  findAccountSessionForRefresh,
  findProfileDocumentId,
  revokeAccountSessionForReplay,
  rotateAccountSession,
} from '@repo/db'
import type { ClientApp, LoginResponse, UserRole } from '@repo/types'
import { TranslationService } from '@repo/i18n/server'
import { hashValue, verifyValue } from '../../common'
import { REFRESH_SESSION_TTL_DAYS } from '../auth.constants'
import { createRefreshTokenMac, parseAndVerifyRefreshToken } from './refresh-token.utils'

export type RefreshedSession = LoginResponse & {
  clientApp: ClientApp
  refreshToken: string
}

@Injectable()
export class RefreshSessionUseCase {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(clientApp: ClientApp, refreshToken: string): Promise<RefreshedSession> {
    const credential = parseAndVerifyRefreshToken(refreshToken)
    if (!credential) {
      throw this.invalidRefreshToken()
    }

    const row = await findAccountSessionForRefresh(credential.sessionDocumentId, clientApp)
    if (!row) {
      throw this.invalidRefreshToken()
    }

    if (credential.version < row.session.refreshTokenVersion) {
      await revokeAccountSessionForReplay(
        credential.sessionDocumentId,
        clientApp,
        credential.version
      )
      throw this.invalidRefreshToken()
    }

    if (credential.version !== row.session.refreshTokenVersion) {
      throw this.invalidRefreshToken()
    }

    if (!(await verifyValue(credential.secret, row.session.refreshTokenHash))) {
      throw this.invalidRefreshToken()
    }

    const replacementSecret = randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + REFRESH_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
    const rotated = await rotateAccountSession({
      documentId: credential.sessionDocumentId,
      clientApp,
      expectedRefreshTokenHash: row.session.refreshTokenHash,
      expectedRefreshTokenVersion: credential.version,
      refreshTokenHash: await hashValue(replacementSecret),
      expiresAt,
    })
    if (!rotated) {
      await revokeAccountSessionForReplay(
        credential.sessionDocumentId,
        clientApp,
        credential.version
      )
      throw this.invalidRefreshToken()
    }

    const sub = await findProfileDocumentId(row.account.id, row.role.name as UserRole)
    if (!sub) {
      throw this.invalidRefreshToken()
    }

    const accessToken = await this.jwtService.signAsync({
      sub,
      email: row.account.email,
      role: row.role.name,
      sessionDocumentId: credential.sessionDocumentId,
    })
    const version = credential.version + 1
    const replacementToken = `${credential.sessionDocumentId}.${version}.${replacementSecret}.${createRefreshTokenMac({ sessionDocumentId: credential.sessionDocumentId, version, secret: replacementSecret })}`

    return { accessToken, clientApp, refreshToken: replacementToken }
  }

  private invalidRefreshToken(): UnauthorizedException {
    return new UnauthorizedException(this.ts.translateError('auth.REFRESH_TOKEN_INVALID'))
  }
}
