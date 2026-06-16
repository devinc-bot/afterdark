import { clientEnv } from '~/config/env'

export const API_BASE_URL = clientEnv.VITE_API_URL

export const API_ROUTES = {
  login: () => `${API_BASE_URL}/api/auth/login` as const,
  register: () => `${API_BASE_URL}/api/auth/register` as const,
} as const
