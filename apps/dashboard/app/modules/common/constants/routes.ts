export const DASHBOARD_ROUTES = {
  home: () => '/' as const,
  clubManagement: () => '/club-management' as const,
  tickets: () => '/tickets' as const,
  userManagement: () => '/users' as const,
  settings: () => '/settings' as const,
  login: () => '/login' as const,
  register: () => '/register' as const,
  forgotPassword: () => '/forgot-password' as const,
  properties: () => '/properties' as const,
  newProperty: () => '/properties/new' as const,
  editProperty: (id: string) => `/properties/${id}/edit` as const,
} as const

export const AUTH_ROUTE_PATHS = new Set<string>([
  DASHBOARD_ROUTES.login(),
  DASHBOARD_ROUTES.register(),
  DASHBOARD_ROUTES.forgotPassword(),
])
