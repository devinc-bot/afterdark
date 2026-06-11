export const DASHBOARD_ROUTES = {
  home: () => '/' as const,
  login: () => '/login' as const,
  register: () => '/register' as const,
  forgotPassword: () => '/forgot-password' as const,
  properties: () => '/properties' as const,
  newProperty: () => '/properties/new' as const,
  editProperty: (id: string) => `/properties/${id}/edit` as const,
} as const
