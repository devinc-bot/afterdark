import { createAuthStorage } from '@repo/common'
import { COOKIE_KEYS } from '~/modules/common/constants/cookies'

const storage = createAuthStorage({ cookieName: COOKIE_KEYS.accessToken })

export const saveAuthSession = storage.saveAuthSession
export const getAuthSession = storage.getAuthSession
export const getAccessTokenSync = storage.getAccessTokenSync
export const clearAuthSession = storage.clearAuthSession
