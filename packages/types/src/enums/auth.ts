export const AUTH_PROVIDER = {
  LOCAL: 'local',
  GOOGLE: 'google',
} as const

export type AuthProvider = (typeof AUTH_PROVIDER)[keyof typeof AUTH_PROVIDER]

export const CLIENT_APP = {
  WEB: 'web',
  DASHBOARD: 'dashboard',
  ADMIN: 'admin',
} as const

export type ClientApp = (typeof CLIENT_APP)[keyof typeof CLIENT_APP]

export const ACCOUNT_SESSION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
} as const

export type AccountSessionStatus =
  (typeof ACCOUNT_SESSION_STATUS)[keyof typeof ACCOUNT_SESSION_STATUS]
export const AUTH_OAUTH_APP = {
  WEB: 'web',
  DASHBOARD: 'dashboard',
} as const

export type AuthOauthApp = (typeof AUTH_OAUTH_APP)[keyof typeof AUTH_OAUTH_APP]
