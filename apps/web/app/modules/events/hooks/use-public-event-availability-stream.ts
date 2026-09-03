import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { PublicEventAvailabilitySnapshot, PublicEventDetailResponse } from '@repo/types'
import { uuidSchema } from '@repo/validators'
import { buildApiPath } from '@repo/common'
import { API_URL, API_ROUTES } from '~/config/api'
import {
  isNewerSseVersion,
  subscribeToSse,
  type SseEvent,
} from '~/modules/common/services/fetch-sse'
import { publicEventDetailQueryKey } from '../queries/use-public-event-detail-query'

const SSE_EVENT_TYPE = { SNAPSHOT: 'snapshot', UPDATE: 'update' } as const
const SSE_HEADER = { ACCEPT: 'Accept' } as const
const SSE_MEDIA_TYPE = 'text/event-stream'

function buildAvailabilityStreamUrl(eventId: string, version: number): string {
  const path = buildApiPath(API_ROUTES.events, API_ROUTES.events.path.availabilityStream(eventId))
  const url = new URL(path, API_URL)
  url.searchParams.set('afterVersion', String(version))
  return url.href
}

function getAvailabilitySnapshot(event: SseEvent): PublicEventAvailabilitySnapshot | null {
  if (event.type !== SSE_EVENT_TYPE.SNAPSHOT) return null
  return event.data as PublicEventAvailabilitySnapshot
}

function getAvailabilityUpdateVersion(event: SseEvent): number | null {
  if (event.type !== SSE_EVENT_TYPE.UPDATE) return null
  const update = event.data as { version?: number }
  return typeof update.version === 'number' ? update.version : null
}

function applyAvailabilitySnapshot(
  event: PublicEventDetailResponse,
  snapshot: PublicEventAvailabilitySnapshot
): PublicEventDetailResponse {
  const quantityByTicketId = new Map(
    snapshot.tickets.map((ticket) => [ticket.ticketDocumentId, ticket.remainingQuantity])
  )
  return {
    ...event,
    tickets: event.tickets.map((ticket) => ({
      ...ticket,
      remainingQuantity: quantityByTicketId.get(ticket.documentId) ?? ticket.remainingQuantity,
    })),
  }
}

export function usePublicEventAvailabilityStream(
  eventId: string | undefined,
  slug: string
): { isStreamActive: boolean } {
  const queryClient = useQueryClient()
  const versionRef = useRef(0)
  const [isStreamActive, setIsStreamActive] = useState(false)
  const isValidEventId = eventId ? uuidSchema.safeParse(eventId).success : false

  useEffect(() => {
    versionRef.current = 0
    setIsStreamActive(false)
    if (!eventId || !isValidEventId) return

    const queryKey = publicEventDetailQueryKey(slug)
    const subscription = subscribeToSse({
      getUrl: () => buildAvailabilityStreamUrl(eventId, versionRef.current),
      getHeaders: () => ({ [SSE_HEADER.ACCEPT]: SSE_MEDIA_TYPE }),
      onConnectionChange: setIsStreamActive,
      onEvent: (event) => {
        const snapshot = getAvailabilitySnapshot(event)
        const version = snapshot?.version ?? getAvailabilityUpdateVersion(event)
        if (version === null || !isNewerSseVersion(version, versionRef.current)) return

        versionRef.current = version
        if (snapshot) {
          queryClient.setQueryData<PublicEventDetailResponse | null>(queryKey, (current) =>
            current ? applyAvailabilitySnapshot(current, snapshot) : current
          )
          return
        }
        void queryClient.invalidateQueries({ queryKey })
      },
    })

    return subscription.unsubscribe
  }, [eventId, isValidEventId, queryClient, slug])

  return { isStreamActive }
}
