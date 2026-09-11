import { ACCESS_TOKEN_COOKIE_NAME } from '@repo/common'
import { CLIENT_APP } from '@repo/types'

export const COOKIE_KEYS = {
  accessToken: ACCESS_TOKEN_COOKIE_NAME[CLIENT_APP.DASHBOARD],
} as const
