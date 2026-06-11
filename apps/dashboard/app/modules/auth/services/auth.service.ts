import { createServerFn } from '@tanstack/react-start'
import { loginSchema } from '@afterdark/validators'
import { API_ROUTES } from '~/config/constants/api'
import type { LoginResponse } from '../types/auth.types'

const LOGIN_FALLBACK_ERROR = 'No pudimos iniciar sesión. Intentá de nuevo en unos minutos.'

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator(loginSchema)
  .handler(async ({ data }): Promise<LoginResponse> => {
    let response: Response

    try {
      response = await fetch(API_ROUTES.login(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } catch {
      throw new Error(LOGIN_FALLBACK_ERROR)
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null
      throw new Error(typeof body?.message === 'string' ? body.message : LOGIN_FALLBACK_ERROR)
    }

    return (await response.json()) as LoginResponse
  })
