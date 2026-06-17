import { createServerFn } from '@tanstack/react-start'
import { loginSchema, registerSchema } from '@afterdark/validators'
import { API_ROUTES } from '~/config/constants/api'
import type { LoginResponse } from '../types/auth.types'

const LOGIN_FALLBACK_ERROR = 'No pudimos iniciar sesión. Intentá de nuevo en unos minutos.'
const REGISTER_FALLBACK_ERROR = 'No pudimos crear tu cuenta. Intentá de nuevo en unos minutos.'

async function parseAuthError(response: Response, fallback: string): Promise<never> {
  let body: { message?: string } | null = null

  try {
    body = await response.json()
  } catch {
    body = null
  }

  const apiMessage = body?.message

  const message = typeof apiMessage === 'string' ? apiMessage : fallback

  throw new Error(message)
}

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
      await parseAuthError(response, LOGIN_FALLBACK_ERROR)
    }

    return (await response.json()) as LoginResponse
  })

export const registerFn = createServerFn({ method: 'POST' })
  .inputValidator(registerSchema)
  .handler(async ({ data }): Promise<LoginResponse> => {
    let response: Response

    try {
      response = await fetch(API_ROUTES.register(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } catch {
      throw new Error(REGISTER_FALLBACK_ERROR)
    }

    if (!response.ok) {
      await parseAuthError(response, REGISTER_FALLBACK_ERROR)
    }

    const json = (await response.json()) as LoginResponse

    return json
  })
