import { API_PREFIX, QueryFactory, createQueryFactoryAuthOptions } from '@repo/common'
import { CLIENT_APP } from '@repo/types'
import { getAccessTokenSync, saveAuthSession } from '~/modules/auth/utils/auth-storage.utils'
import { clearLocalSession } from '~/modules/common/services/session-cleanup'
import { clientEnv } from './env'
export { API_ROUTES } from '@repo/common'

const apiBaseUrl = import.meta.env.SSR
  ? (process.env.SERVER_API_URL ?? clientEnv.VITE_API_URL)
  : clientEnv.VITE_API_URL

export const API_URL = `${apiBaseUrl}/${API_PREFIX}` as const

export const api = new QueryFactory(
  API_URL,
  createQueryFactoryAuthOptions({
    app: CLIENT_APP.WEB,
    getAccessToken: getAccessTokenSync,
    saveAuthSession,
    clearLocalSession,
    isSsr: import.meta.env.SSR,
  })
)
