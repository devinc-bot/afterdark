import { CLIENT_APP, USER_ROLE, type UserRole } from '@repo/types'

export const ACCESS_TOKEN_TTL = '15m'
export const REFRESH_SESSION_TTL_DAYS = 30
export const REFRESH_COOKIE_MAX_AGE_MS = REFRESH_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
export const REFRESH_COOKIE_PATH = '/api/auth' as const
export const REFRESH_COOKIE_SAME_SITE = 'lax' as const

export const REFRESH_COOKIE_NAME = {
  web: 'app.web.auth.refresh',
  dashboard: 'app.dashboard.auth.refresh',
  admin: 'app.admin.auth.refresh',
} as const satisfies Record<(typeof CLIENT_APP)[keyof typeof CLIENT_APP], string>

export const CLIENT_APP_BY_USER_ROLE = {
  [USER_ROLE.USER]: CLIENT_APP.WEB,
  [USER_ROLE.OWNER]: CLIENT_APP.DASHBOARD,
  [USER_ROLE.STAFF]: CLIENT_APP.DASHBOARD,
  [USER_ROLE.ADMIN]: CLIENT_APP.ADMIN,
} as const satisfies Record<UserRole, (typeof CLIENT_APP)[keyof typeof CLIENT_APP]>
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
