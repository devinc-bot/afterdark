import { createServerFn } from '@tanstack/react-start'
import { loginSchema, registerOwnerSchema } from '@afterdark/validators'
import { translateSync } from '@afterdark/i18n'
import { API_ROUTES, api } from '~/config/api'
import { throwApiServiceError, buildApiPath } from '@afterdark/common'
import type { LoginResponse, RegisterResponse } from '@afterdark/types'

async function postAuth<T>(path: string, data: unknown, fallback: string): Promise<T> {
  try {
    return await api.post<T>(path, data)
  } catch (error) {
    throwApiServiceError(error, fallback)
  }
}

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator(loginSchema)
  .handler(async ({ data }): Promise<LoginResponse> => {
    return postAuth<LoginResponse>(
      buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.login()),
      data,
      translateSync('auth:login.error.fallback')
    )
  })

export const registerOwnerFn = createServerFn({ method: 'POST' })
  .inputValidator(registerOwnerSchema)
  .handler(async ({ data }): Promise<RegisterResponse> => {
    return postAuth<RegisterResponse>(
      buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.registerOwner()),
      data,
      translateSync('auth:register.error.fallback')
    )
  })
