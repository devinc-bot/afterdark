import { useQuery } from '@tanstack/react-query'
import { slugSchema } from '@repo/validators'
import { fetchPublicOrganizationProfile } from '../services/public-organizations.service'

export const publicOrganizationProfileQueryKey = (slug: string, page: number) =>
  ['public-organization-profile', slug, page] as const

export function isPublicOrganizationSlug(slug: string): boolean {
  return slugSchema.safeParse(slug).success
}

export function usePublicOrganizationProfileQuery(slug: string, page: number) {
  return useQuery({
    queryKey: publicOrganizationProfileQueryKey(slug, page),
    queryFn: () => fetchPublicOrganizationProfile(slug, page),
    enabled: isPublicOrganizationSlug(slug),
  })
}
