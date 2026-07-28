import { useQuery } from '@tanstack/react-query'
import { uuidSchema } from '@repo/validators'
import { fetchPublicEventDetail } from '../services/public-events.service'

export const publicEventDetailQueryKey = (documentId: string) =>
  ['public-event-detail', documentId] as const

export function isPublicEventDocumentId(documentId: string): boolean {
  return uuidSchema.safeParse(documentId).success
}

export function usePublicEventDetailQuery(documentId: string) {
  return useQuery({
    queryKey: publicEventDetailQueryKey(documentId),
    queryFn: () => fetchPublicEventDetail(documentId),
    enabled: isPublicEventDocumentId(documentId),
  })
}
