import { createServerFn } from '@tanstack/react-start'
import type { LoginResponse } from '@repo/types'
import { loginSchema } from '@repo/validators'
import { translateSync } from '@repo/i18n'
import { buildApiPath, throwApiServiceError } from '@repo/common'
import { API_ROUTES, api } from '~/config/api'

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator(loginSchema)
  .handler(async ({ data }): Promise<LoginResponse> => {
    try {
      return await api.post<LoginResponse>(
        buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.login()),
        data
      )
    } catch (error) {
      throwApiServiceError(error, translateSync('auth:login.error.fallback'))
    }
  })
