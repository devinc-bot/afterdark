import { CLIENT_ROUTES } from '@repo/common'

const { resetPassword, registerConfirm, authCallback, login } = CLIENT_ROUTES

export const WEB_ROUTES = {
  home: () => '/' as const,
  events: () => '/events' as const,
  settings: () => '/settings' as const,
  properties: () => '/properties' as const,
  property: (id: string) => `/properties/${id}` as const,
  login,
  register: () => '/register' as const,
  registerConfirm,
  forgotPassword: () => '/forgot-password' as const,
  resetPassword,
  authCallback,
} as const

export const AUTH_ROUTE_PATHS = new Set<string>([
  WEB_ROUTES.login(),
  WEB_ROUTES.register(),
  WEB_ROUTES.registerConfirm(),
  WEB_ROUTES.forgotPassword(),
  CLIENT_ROUTES.resetPassword(),
  CLIENT_ROUTES.authCallback(),
])
