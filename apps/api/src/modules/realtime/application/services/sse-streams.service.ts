import { Injectable, NotFoundException } from '@nestjs/common'
import {
  findDomainOutboxEvents,
  findPublishedEventAvailabilityByDocumentId,
  findPurchaseByDocumentIdAndUserId,
  findUserIdByDocumentId,
} from '@repo/db'
import type { MessageEvent } from '@nestjs/common'
import { OUTBOX_AGGREGATE_TYPE } from '@repo/types'
import { Observable } from 'rxjs'

const SSE_POLL_INTERVAL_MS = 5_000
const SSE_HEARTBEAT_INTERVAL_MS = 25_000
const SSE_EVENT_TYPE = {
  SNAPSHOT: 'snapshot',
  UPDATE: 'update',
  HEARTBEAT: 'heartbeat',
} as const

type Snapshot = { version: number; data: Record<string, unknown> }

function toSseEvent(type: string, data: Record<string, unknown>, id?: string): MessageEvent {
  return { type, data, ...(id ? { id } : {}) }
}

@Injectable()
export class SseStreamsService {
  async createPurchaseStream(
    userDocumentId: string,
    purchaseDocumentId: string,
    afterVersion: number
  ): Promise<Observable<MessageEvent>> {
    const userId = await findUserIdByDocumentId(userDocumentId)
    const purchase = userId
      ? await findPurchaseByDocumentIdAndUserId(purchaseDocumentId, userId)
      : null
    if (!purchase) throw new NotFoundException()

    const snapshot: Snapshot = {
      version: purchase.purchase.stateVersion,
      data: {
        purchaseDocumentId: purchase.purchase.documentId,
        status: purchase.purchase.status,
        paymentStatus: purchase.payment.status,
        expiresAt: purchase.purchase.expiresAt?.toISOString() ?? null,
        version: purchase.purchase.stateVersion,
      },
    }
    return this.createDurableStream(
      OUTBOX_AGGREGATE_TYPE.PURCHASE,
      purchaseDocumentId,
      afterVersion,
      snapshot
    )
  }

  async createPublishedEventAvailabilityStream(
    eventDocumentId: string,
    afterVersion: number
  ): Promise<Observable<MessageEvent>> {
    const availability = await findPublishedEventAvailabilityByDocumentId(eventDocumentId)
    if (!availability) throw new NotFoundException()

    return this.createDurableStream(
      OUTBOX_AGGREGATE_TYPE.EVENT_AVAILABILITY,
      eventDocumentId,
      afterVersion,
      { version: availability.version, data: availability }
    )
  }

  private createDurableStream(
    aggregateType: string,
    aggregateDocumentId: string,
    afterVersion: number,
    snapshot: Snapshot
  ): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      let deliveredVersion = afterVersion
      let catchupRunning = false

      const emitCatchup = async () => {
        if (catchupRunning || subscriber.closed) return
        catchupRunning = true
        try {
          const events = await findDomainOutboxEvents({
            aggregateType,
            aggregateDocumentId,
            afterVersion: deliveredVersion,
          })
          for (const event of events) {
            if (subscriber.closed) return
            deliveredVersion = event.aggregateVersion
            subscriber.next(
              toSseEvent(
                SSE_EVENT_TYPE.UPDATE,
                {
                  eventType: event.eventType,
                  version: event.aggregateVersion,
                  payload: event.payload,
                },
                event.documentId
              )
            )
          }
        } catch (error) {
          subscriber.error(error)
        } finally {
          catchupRunning = false
        }
      }

      subscriber.next(toSseEvent(SSE_EVENT_TYPE.SNAPSHOT, snapshot.data))
      void emitCatchup()
      const pollTimer = setInterval(() => void emitCatchup(), SSE_POLL_INTERVAL_MS)
      const heartbeatTimer = setInterval(() => {
        subscriber.next(toSseEvent(SSE_EVENT_TYPE.HEARTBEAT, { version: deliveredVersion }))
      }, SSE_HEARTBEAT_INTERVAL_MS)

      return () => {
        clearInterval(pollTimer)
        clearInterval(heartbeatTimer)
      }
    })
  }
}
