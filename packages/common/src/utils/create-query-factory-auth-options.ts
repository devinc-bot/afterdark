import type { ClientApp, LoginResponse } from '@repo/types'
import { API_ROUTES, buildApiPath } from '../config/api-routes.ts'
import type { QueryFactoryOptions } from '../lib/query-factory.ts'

export type CreateQueryFactoryAuthOptionsInput = {
  app: ClientApp
  getAccessToken: () => string | null
  saveAuthSession: (session: LoginResponse) => void | Promise<void>
  clearLocalSession: () => void | Promise<void>
  isSsr: boolean
}

export function createQueryFactoryAuthOptions(
  input: CreateQueryFactoryAuthOptionsInput
): QueryFactoryOptions {
  return {
    getAccessToken: input.getAccessToken,
    onAuthenticationFailure: input.clearLocalSession,
    ...(input.isSsr
      ? {}
      : {
          refresh: {
            path: buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.refreshToken()),
            data: { app: input.app },
            onSuccess: input.saveAuthSession,
          },
        }),
  }
}
