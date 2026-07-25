import { API_URL, QueryFactory } from '@repo/common'
import { getAccessTokenSync } from '~/modules/auth/utils/auth-storage.utils'

export { API_ROUTES } from '@repo/common'

export const api = new QueryFactory(API_URL, {
  getAccessToken: getAccessTokenSync,
})
