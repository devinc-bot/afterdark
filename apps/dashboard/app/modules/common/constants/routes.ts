export const DASHBOARD_ROUTES = {
  home: () => '/dashboard' as const,
  clubManagement: () => '/club-management' as const,
  clubManagementNew: () => '/club-management/new' as const,
  clubManagementEdit: (documentId: string) => `/club-management/${documentId}/edit` as const,
  tickets: () => '/tickets' as const,
  events: () => '/events' as const,
  staff: () => '/staff' as const,
  settings: () => '/settings' as const,
  login: () => '/login' as const,
  register: () => '/register' as const,
  forgotPassword: () => '/forgot-password' as const,
} as const

export const AUTH_ROUTE_PATHS = new Set<string>([
  DASHBOARD_ROUTES.login(),
  DASHBOARD_ROUTES.register(),
  DASHBOARD_ROUTES.forgotPassword(),
])
