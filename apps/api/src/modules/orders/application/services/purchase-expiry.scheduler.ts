import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { findExpiredActiveReservationDocumentIds, releaseReservationOnce } from '@repo/db'
import { INVENTORY_RESERVATION_STATUS, PURCHASE_STATUS } from '@repo/types'
import { runCleanupJob } from '../../../common'

const EXPIRY_BATCH_SIZE = 100

@Injectable()
export class PurchaseExpiryScheduler {
  private readonly logger = new Logger(PurchaseExpiryScheduler.name)

  @Cron(CronExpression.EVERY_MINUTE)
  async expireReservations(): Promise<void> {
    await runCleanupJob({
      logger: this.logger,
      failureMessage: 'Purchase reservation expiry failed',
      successMessage: (n) => `Expired ${n} purchase reservation(s)`,
      run: async () => {
        const now = new Date()
        const reservationDocumentIds = await this.findExpiredReservationDocumentIds(now)
        const results = await Promise.all(
          reservationDocumentIds.map((reservationDocumentId) =>
            this.expireReservation(reservationDocumentId, now)
          )
        )
        return results.filter(Boolean).length
      },
    })
  }

  protected findExpiredReservationDocumentIds(now: Date): Promise<string[]> {
    return findExpiredActiveReservationDocumentIds(now, EXPIRY_BATCH_SIZE)
  }

  protected async expireReservation(reservationDocumentId: string, now: Date): Promise<boolean> {
    const result = await releaseReservationOnce({
      reservationDocumentId,
      purchaseStatus: PURCHASE_STATUS.EXPIRED,
      reservationStatus: INVENTORY_RESERVATION_STATUS.EXPIRED,
      now,
    })
    return result.transitioned
  }
}
