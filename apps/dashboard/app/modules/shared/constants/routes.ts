export const DASHBOARD_ROUTES = {
  home: () => '/' as const,
  properties: () => '/properties' as const,
  newProperty: () => '/properties/new' as const,
  editProperty: (id: string) => `/properties/${id}/edit` as const,
} as const
