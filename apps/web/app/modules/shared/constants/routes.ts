export const WEB_ROUTES = {
  home: () => "/" as const,
  properties: () => "/properties" as const,
  property: (id: string) => `/properties/${id}` as const,
} as const;
