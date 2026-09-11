import { useQuery } from '@tanstack/react-query'
import { slugSchema } from '@repo/validators'
import { fetchPublicEventDetail } from '../services/public-events.service'

export const publicEventDetailQueryKey = (slug: string) => ['public-event-detail', slug] as const

export function isPublicEventSlug(slug: string): boolean {
  return slugSchema.safeParse(slug).success
}

export function usePublicEventDetailQuery(slug: string) {
  return useQuery({
    queryKey: publicEventDetailQueryKey(slug),
    queryFn: () => fetchPublicEventDetail(slug),
    enabled: isPublicEventSlug(slug),
  })
}
