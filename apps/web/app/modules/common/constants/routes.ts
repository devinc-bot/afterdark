import { CLIENT_ROUTES } from '@afterdark/common'

const { resetPassword, authCallback, login } = CLIENT_ROUTES

export const WEB_ROUTES = {
  home: () => '/' as const,
  events: () => '/events' as const,
  settings: () => '/settings' as const,
  properties: () => '/properties' as const,
  property: (id: string) => `/properties/${id}` as const,
  login,
  register: () => '/register' as const,
  forgotPassword: () => '/forgot-password' as const,
  resetPassword,
  authCallback,
} as const

export const AUTH_ROUTE_PATHS = new Set<string>([
  WEB_ROUTES.login(),
  WEB_ROUTES.register(),
  WEB_ROUTES.forgotPassword(),
  CLIENT_ROUTES.resetPassword(),
  CLIENT_ROUTES.authCallback(),
])
