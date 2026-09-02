import { API_PREFIX, QueryFactory } from '@repo/common'
import { getAccessTokenSync } from '~/modules/auth/utils/auth-storage.utils'
import { clientEnv } from './env'

export { API_ROUTES } from '@repo/common'

const apiBaseUrl = import.meta.env.SSR
  ? (process.env.SERVER_API_URL ?? clientEnv.VITE_API_URL)
  : clientEnv.VITE_API_URL

export const API_URL = `${apiBaseUrl}/${API_PREFIX}` as const

export const api = new QueryFactory(API_URL, {
  getAccessToken: getAccessTokenSync,
})
