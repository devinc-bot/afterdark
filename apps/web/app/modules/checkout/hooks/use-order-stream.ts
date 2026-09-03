import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  PAYMENT_ATTEMPT_STATUS,
  PAYMENT_STATUS,
  PURCHASE_STATUS,
  type OrderResponse,
  type PurchaseStreamSnapshot,
} from '@repo/types'
import { uuidSchema } from '@repo/validators'
import { buildApiPath } from '@repo/common'
import { API_URL, API_ROUTES } from '~/config/api'
import { getAccessTokenSync } from '~/modules/auth/utils/auth-storage.utils'
import {
  isNewerSseVersion,
  subscribeToSse,
  type SseEvent,
} from '~/modules/common/services/fetch-sse'

const ORDER_QUERY_KEY = (orderId: string) => ['order', orderId] as const
const SSE_EVENT_TYPE = { SNAPSHOT: 'snapshot', UPDATE: 'update' } as const
const SSE_HEADER = { ACCEPT: 'Accept', AUTHORIZATION: 'Authorization' } as const
const SSE_MEDIA_TYPE = 'text/event-stream'

type PurchaseStreamUpdate = PurchaseStreamSnapshot

function toPaymentStatus(update: PurchaseStreamUpdate): OrderResponse['status'] {
  if (update.status === PURCHASE_STATUS.CONFIRMED) return PAYMENT_STATUS.COMPLETED
  if (update.paymentStatus === PAYMENT_ATTEMPT_STATUS.REJECTED) return PAYMENT_STATUS.REJECTED
  if (update.status === PURCHASE_STATUS.PENDING) return PAYMENT_STATUS.PENDING
  return PAYMENT_STATUS.CANCELLED
}

function getPurchaseStreamUpdate(event: SseEvent): PurchaseStreamUpdate | null {
  if (event.type === SSE_EVENT_TYPE.SNAPSHOT) return event.data as PurchaseStreamUpdate
  if (event.type !== SSE_EVENT_TYPE.UPDATE) return null

  const update = event.data as { payload?: PurchaseStreamUpdate }
  return update.payload ?? null
}

function buildPurchaseStreamUrl(orderId: string, version: number): string {
  const path = buildApiPath(API_ROUTES.orders, API_ROUTES.orders.path.stream(orderId))
  const url = new URL(path, API_URL)
  url.searchParams.set('afterVersion', String(version))
  return url.href
}

export function useOrderStream(orderId: string): { isStreamActive: boolean } {
  const queryClient = useQueryClient()
  const versionRef = useRef(0)
  const [isStreamActive, setIsStreamActive] = useState(false)
  const isValidOrderId = uuidSchema.safeParse(orderId).success

  useEffect(() => {
    versionRef.current = 0
    setIsStreamActive(false)
    if (!isValidOrderId) return

    const subscription = subscribeToSse({
      getUrl: () => buildPurchaseStreamUrl(orderId, versionRef.current),
      getHeaders: () => {
        const token = getAccessTokenSync()
        return {
          [SSE_HEADER.ACCEPT]: SSE_MEDIA_TYPE,
          ...(token ? { [SSE_HEADER.AUTHORIZATION]: `Bearer ${token}` } : {}),
        }
      },
      onConnectionChange: setIsStreamActive,
      onEvent: (event) => {
        const update = getPurchaseStreamUpdate(event)
        if (!update || !isNewerSseVersion(update.version, versionRef.current)) return

        versionRef.current = update.version
        queryClient.setQueryData<OrderResponse>(ORDER_QUERY_KEY(orderId), (current) =>
          current ? { ...current, status: toPaymentStatus(update) } : current
        )
        void queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY(orderId) })
      },
    })

    return subscription.unsubscribe
  }, [isValidOrderId, orderId, queryClient])

  return { isStreamActive }
}
