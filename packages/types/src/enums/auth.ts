export const AUTH_PROVIDER = {
  LOCAL: 'local',
  GOOGLE: 'google',
} as const

export type AuthProvider = (typeof AUTH_PROVIDER)[keyof typeof AUTH_PROVIDER]

export const AUTH_OAUTH_APP = {
  WEB: 'web',
  DASHBOARD: 'dashboard',
} as const

export type AuthOauthApp = (typeof AUTH_OAUTH_APP)[keyof typeof AUTH_OAUTH_APP]
