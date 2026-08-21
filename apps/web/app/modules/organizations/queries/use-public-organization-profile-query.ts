import { useQuery } from '@tanstack/react-query'
import { uuidSchema } from '@repo/validators'
import { fetchPublicOrganizationProfile } from '../services/public-organizations.service'

export const publicOrganizationProfileQueryKey = (documentId: string, page: number) =>
  ['public-organization-profile', documentId, page] as const

export function isPublicOrganizationDocumentId(documentId: string): boolean {
  return uuidSchema.safeParse(documentId).success
}

export function usePublicOrganizationProfileQuery(documentId: string, page: number) {
  return useQuery({
    queryKey: publicOrganizationProfileQueryKey(documentId, page),
    queryFn: () => fetchPublicOrganizationProfile(documentId, page),
    enabled: isPublicOrganizationDocumentId(documentId),
  })
}
