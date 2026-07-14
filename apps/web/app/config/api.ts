import { API_URL, QueryFactory } from '@afterdark/common'
import { getAccessTokenSync } from '~/modules/auth/utils/auth-storage.utils'

export { API_ROUTES } from '@afterdark/common'

export const api = new QueryFactory(API_URL, {
  getAccessToken: getAccessTokenSync,
})
