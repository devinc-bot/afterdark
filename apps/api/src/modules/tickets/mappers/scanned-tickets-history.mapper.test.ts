import { expect, test } from 'vitest'
import type { ScannedTicketHistoryRow } from '@repo/types'
import { toScannedTicketHistoryItem } from './scanned-tickets-history.mapper.ts'

const baseRow: ScannedTicketHistoryRow = {
  scannedAt: new Date('2026-08-17T22:00:00.000Z'),
  ticket: { ticketType: { documentId: 'type-vip', name: 'VIP' } },
  purchaser: {
    name: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    phone: '11111111',
  },
  operator: { accountId: 1, fullName: 'Grace Hopper', email: 'grace@example.com', role: 'owner' },
}

test('maps a scanned ticket with operator into a history item', () => {
  const result = toScannedTicketHistoryItem(baseRow)

  expect(result).toEqual({
    purchaser: { fullName: 'Ada Lovelace', email: 'ada@example.com', phone: '11111111' },
    operator: { fullName: 'Grace Hopper', email: 'grace@example.com', role: 'owner' },
    ticket: { ticketType: { documentId: 'type-vip', name: 'VIP' } },
    scannedAt: baseRow.scannedAt,
  })
})

test('reports a null operator for pre-operator-tracking scans', () => {
  const result = toScannedTicketHistoryItem({
    ...baseRow,
    operator: { accountId: null, fullName: null, email: null, role: null },
  })

  expect(result.operator).toBeNull()
})

test('normalizes an empty purchaser phone to null', () => {
  const result = toScannedTicketHistoryItem({
    ...baseRow,
    purchaser: { ...baseRow.purchaser, phone: '' },
  })

  expect(result.purchaser.phone).toBeNull()
})
