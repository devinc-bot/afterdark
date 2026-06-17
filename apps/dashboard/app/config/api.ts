import { API_BASE_URL } from '~/config/constants/api'
import { QueryFactory } from '~/modules/common/utils/query-factory'

export const api = new QueryFactory(API_BASE_URL)
