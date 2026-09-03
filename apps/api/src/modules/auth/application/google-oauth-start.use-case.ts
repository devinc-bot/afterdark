import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { GoogleOauthStartInput } from '@repo/validators'
import {
  GOOGLE_OAUTH_ERROR,
  GOOGLE_OAUTH_STATE_PURPOSE,
  GOOGLE_OAUTH_STATE_TTL,
} from '../auth.constants'
import { GoogleOauthService } from './services/google-oauth.service'
import { buildAppLoginErrorUrl } from '../utils/google-oauth.utils'

export type GoogleOauthStatePayload = {
  purpose: typeof GOOGLE_OAUTH_STATE_PURPOSE
  role: GoogleOauthStartInput['role']
  app: GoogleOauthStartInput['app']
}

@Injectable()
export class GoogleOauthStartUseCase {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(GoogleOauthService) private readonly googleOauth: GoogleOauthService
  ) {}

  async execute(input: GoogleOauthStartInput): Promise<string> {
    if (!this.googleOauth.isConfigured()) {
      return buildAppLoginErrorUrl(input.app, GOOGLE_OAUTH_ERROR.FAILED)
    }

    const state = await this.jwtService.signAsync(
      {
        purpose: GOOGLE_OAUTH_STATE_PURPOSE,
        role: input.role,
        app: input.app,
      } satisfies GoogleOauthStatePayload,
      { expiresIn: GOOGLE_OAUTH_STATE_TTL }
    )

    return this.googleOauth.buildAuthorizationUrl(state, input.app)
  }
}
