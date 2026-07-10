import { QueryFactory } from '@afterdark/common'
import { getAccessToken } from '~/modules/auth/utils/auth-storage.utils'
import { API_URL } from '@afterdark/common'
export { API_ROUTES } from '@afterdark/common'

export const api = new QueryFactory(API_URL, {
  getAccessToken,
})
