import { CLIENT_ROUTES } from '@repo/common'

const { resetPassword, registerConfirm, authCallback, login } = CLIENT_ROUTES

export const DASHBOARD_ROUTES = {
  home: () => '/dashboard' as const,
  locations: () => '/locations' as const,
  locationsNew: () => '/locations/new' as const,
  locationsEdit: (documentId: string) => `/locations/${documentId}/edit` as const,
  tickets: () => '/tickets' as const,
  ticketsNew: () => '/tickets/new' as const,
  ticketsEdit: (documentId: string) => `/tickets/${documentId}/edit` as const,
  events: () => '/events' as const,
  eventsNew: () => '/events/new' as const,
  eventsEdit: (documentId: string) => `/events/${documentId}/edit` as const,
  sales: () => '/sales' as const,
  staff: () => '/staff' as const,
  settings: () => '/settings' as const,
  login,
  register: () => '/register' as const,
  registerConfirm,
  forgotPassword: () => '/forgot-password' as const,
  resetPassword,
  authCallback,
} as const

export const AUTH_ROUTE_PATHS = new Set<string>([
  DASHBOARD_ROUTES.login(),
  DASHBOARD_ROUTES.register(),
  DASHBOARD_ROUTES.registerConfirm(),
  DASHBOARD_ROUTES.forgotPassword(),
  DASHBOARD_ROUTES.resetPassword(),
  DASHBOARD_ROUTES.authCallback(),
])
