import { describe, expect, test } from 'vitest'
import { PAYMENT_STATUS } from '@repo/types'
import { getOrderRefetchInterval } from './order-polling.ts'

describe('getOrderRefetchInterval', () => {
  test('polls a pending purchase while its private SSE stream is unavailable', () => {
    expect(getOrderRefetchInterval(PAYMENT_STATUS.PENDING, false)).toBe(3000)
  })

  test('stops polling after connection or a terminal purchase status', () => {
    expect(getOrderRefetchInterval(PAYMENT_STATUS.PENDING, true)).toBe(false)
    expect(getOrderRefetchInterval(PAYMENT_STATUS.COMPLETED, false)).toBe(false)
  })
})
