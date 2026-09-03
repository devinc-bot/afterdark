import { expect, test, vi } from 'vitest'
import { Logger } from '@nestjs/common'
import { PurchaseExpiryScheduler } from './purchase-expiry.scheduler.ts'

class TestPurchaseExpiryScheduler extends PurchaseExpiryScheduler {
  reservationDocumentIds: string[] = []
  expiredReservationDocumentIds: string[] = []
  expiryError: Error | undefined

  protected override async findExpiredReservationDocumentIds(): Promise<string[]> {
    return this.reservationDocumentIds
  }

  protected override async expireReservation(reservationDocumentId: string): Promise<boolean> {
    if (this.expiryError) throw this.expiryError
    this.expiredReservationDocumentIds.push(reservationDocumentId)
    return true
  }
}

test('expires every active reservation returned in the bounded batch', async () => {
  const scheduler = new TestPurchaseExpiryScheduler()
  scheduler.reservationDocumentIds = ['reservation-1', 'reservation-2']

  await scheduler.expireReservations()

  expect(scheduler.expiredReservationDocumentIds).toEqual(['reservation-1', 'reservation-2'])
})

test('logs expiry failures without rejecting the scheduled invocation', async () => {
  const scheduler = new TestPurchaseExpiryScheduler()
  const error = new Error('database unavailable')
  const loggedErrors: unknown[][] = []
  scheduler.reservationDocumentIds = ['reservation-1']
  scheduler.expiryError = error
  vi.spyOn(Logger.prototype, 'error').mockImplementation((...args: unknown[]) => {
    loggedErrors.push(args)
  })

  await scheduler.expireReservations()

  expect(loggedErrors).toEqual([['Purchase reservation expiry failed', error]])
})
