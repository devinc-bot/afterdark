export const ACCESS_TOKEN_TTL = '1d'
export const PASSWORD_RESET_TOKEN_TTL_MINUTES = 60
export const PASSWORD_RESET_MAX_ATTEMPTS_PER_DAY = 10

export const GOOGLE_OAUTH_STATE_PURPOSE = 'google_oauth' as const
export const GOOGLE_OAUTH_STATE_TTL = '10m' as const
export const GOOGLE_OAUTH_SCOPES = ['openid', 'email', 'profile'] as const

export const GOOGLE_OAUTH_ERROR = {
  EMAIL_EXISTS: 'email_exists',
  CANCELLED: 'google_cancelled',
  FAILED: 'google_failed',
} as const

export type GoogleOauthErrorCode = (typeof GOOGLE_OAUTH_ERROR)[keyof typeof GOOGLE_OAUTH_ERROR]
