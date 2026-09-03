import type { QueryFactoryResponse } from './query-factory.ts'

const SET_COOKIE_HEADER = 'Set-Cookie'

type SetCookieResponseHeaders = {
  append: (name: string, value: string) => void
}

export function forwardApiSetCookieHeaders<T>(
  apiResponse: QueryFactoryResponse<T>,
  responseHeaders: SetCookieResponseHeaders
): T {
  for (const cookie of apiResponse.headers.getSetCookie()) {
    responseHeaders.append(SET_COOKIE_HEADER, cookie)
  }

  return apiResponse.data
}
