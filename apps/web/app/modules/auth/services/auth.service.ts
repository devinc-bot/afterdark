import { createServerFn } from '@tanstack/react-start'
import { loginSchema, registerUserSchema } from '@afterdark/validators'
import { translateSync } from '@afterdark/i18n'
import { throwApiServiceError, buildApiPath } from '@afterdark/common'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/api'
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

export const registerUserFn = createServerFn({ method: 'POST' })
  .inputValidator(registerUserSchema)
  .handler(async ({ data }): Promise<RegisterResponse> => {
    return postAuth<RegisterResponse>(
      buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.registerUser()),
      data,
      translateSync('auth:register.error.fallback')
    )
  })
