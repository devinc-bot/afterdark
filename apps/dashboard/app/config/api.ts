import { API_PREFIX, QueryFactory } from '@repo/common'
import { getAccessTokenSync } from '~/modules/auth/utils/auth-storage.utils'
import { clientEnv } from './env'

export { API_ROUTES } from '@repo/common'


export const API_URL = `${clientEnv.VITE_API_URL}/${API_PREFIX}` as const

export const api = new QueryFactory(API_URL, {
  getAccessToken: getAccessTokenSync,
})
