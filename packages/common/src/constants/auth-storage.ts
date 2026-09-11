import { CLIENT_APP, type ClientApp } from '@repo/types'

export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000

/** Stable access-token cookie names — do not rename (breaks live sessions). */
export const ACCESS_TOKEN_COOKIE_NAME = {
  [CLIENT_APP.WEB]: 'app.web.auth.token',
  [CLIENT_APP.DASHBOARD]: 'app.dashboard.auth.token',
  [CLIENT_APP.ADMIN]: 'app.admin.auth.token',
} as const satisfies Record<ClientApp, string>
