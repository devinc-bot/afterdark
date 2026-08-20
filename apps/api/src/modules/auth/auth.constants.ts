export const ACCESS_TOKEN_TTL = '1d'
export const PASSWORD_RESET_TOKEN_TTL_MINUTES = 60
export const PASSWORD_RESET_MAX_ATTEMPTS_PER_DAY = 10
export const USER_REGISTRATION_TOKEN_TTL_MINUTES = 60
export const USER_REGISTRATION_MAX_ATTEMPTS_PER_DAY = 10
export const OWNER_REGISTRATION_TOKEN_TTL_MINUTES = 60
export const TICKET_QR_TOKEN_TTL_MINUTES = 20
export const OWNER_REGISTRATION_MAX_ATTEMPTS_PER_DAY = 10

export const GOOGLE_OAUTH_STATE_PURPOSE = 'google_oauth' as const
export const GOOGLE_OAUTH_STATE_TTL = '10m' as const
export const GOOGLE_OAUTH_SCOPES = ['openid', 'email', 'profile'] as const

export const GOOGLE_OAUTH_ERROR = {
  EMAIL_EXISTS: 'email_exists',
  CANCELLED: 'google_cancelled',
  FAILED: 'google_failed',
  PENDING_APPROVAL: 'google_pending_approval',
} as const

export type GoogleOauthErrorCode = (typeof GOOGLE_OAUTH_ERROR)[keyof typeof GOOGLE_OAUTH_ERROR]
