import { createHmac } from 'node:crypto'
import { beforeEach, expect, test, vi } from 'vitest'

const repositories = vi.hoisted(() => ({
  reconcileMercadoPagoPayment: vi.fn(),
}))

vi.mock('@repo/db', () => repositories)

import { ReconcileMercadoPagoWebhookUseCase } from './reconcile-webhook.use-case.ts'

beforeEach(() => {
  vi.clearAllMocks()
  repositories.reconcileMercadoPagoPayment.mockResolvedValue(undefined)
})

test('accepts a legacy payment notification with its resource as the payment ID', async () => {
  const requestId = 'request-123'
  const timestamp = String(Math.floor(Date.now() / 1000))
  const paymentId = 'payment-123'
  const manifest = `request-id:${requestId};ts:${timestamp};`
  const signature = createHmac('sha256', process.env.MERCADOPAGO_WEBHOOK_SECRET ?? '')
    .update(manifest)
    .digest('hex')
  let receivedPaymentId: string | undefined
  const useCase = new ReconcileMercadoPagoWebhookUseCase(
    { translateError: (code: string) => code } as never,
    {
      getPayment: async (id: string) => {
        receivedPaymentId = id
        return {}
      },
    } as never
  )

  await useCase.execute(
    { resource: paymentId, topic: 'payment' },
    `ts=${timestamp},v1=${signature}`,
    requestId,
    undefined
  )

  expect(receivedPaymentId).toBe(paymentId)
})

test('includes the query payment ID in the webhook signature manifest', async () => {
  const requestId = 'request-456'
  const timestamp = String(Math.floor(Date.now() / 1000))
  const paymentId = 'payment-456'
  const manifest = `id:${paymentId};request-id:${requestId};ts:${timestamp};`
  const signature = createHmac('sha256', process.env.MERCADOPAGO_WEBHOOK_SECRET ?? '')
    .update(manifest)
    .digest('hex')
  let receivedPaymentId: string | undefined
  const useCase = new ReconcileMercadoPagoWebhookUseCase(
    { translateError: (code: string) => code } as never,
    {
      getPayment: async (id: string) => {
        receivedPaymentId = id
        return {}
      },
    } as never
  )

  await useCase.execute(
    { type: 'payment', data: { id: paymentId } },
    `ts=${timestamp},v1=${signature}`,
    requestId,
    paymentId
  )

  expect(receivedPaymentId).toBe(paymentId)
})

test('omits a missing request ID from the webhook signature manifest', async () => {
  const timestamp = String(Math.floor(Date.now() / 1000))
  const paymentId = 'payment-789'
  const signature = createHmac('sha256', process.env.MERCADOPAGO_WEBHOOK_SECRET ?? '')
    .update(`ts:${timestamp};`)
    .digest('hex')
  let receivedPaymentId: string | undefined
  const useCase = new ReconcileMercadoPagoWebhookUseCase(
    { translateError: (code: string) => code } as never,
    {
      getPayment: async (id: string) => {
        receivedPaymentId = id
        return {}
      },
    } as never
  )

  await useCase.execute(
    { resource: paymentId, topic: 'payment' },
    `ts=${timestamp},v1=${signature}`,
    undefined,
    undefined
  )

  expect(receivedPaymentId).toBe(paymentId)
})

test('rejects a valid signature outside the webhook replay window', async () => {
  const useCase = new ReconcileMercadoPagoWebhookUseCase(
    { translateError: (code: string) => code } as never,
    { getPayment: async () => ({}) } as never
  )
  const requestId = 'request-123'
  const timestamp = String(Math.floor(Date.now() / 1000) - 301)
  const manifest = `id:payment-123;request-id:${requestId};ts:${timestamp};`
  const signature = createHmac('sha256', process.env.MERCADOPAGO_WEBHOOK_SECRET ?? '')
    .update(manifest)
    .digest('hex')

  await expect(
    useCase.execute(
      { type: 'payment', data: { id: 'payment-123' } },
      `ts=${timestamp},v1=${signature}`,
      requestId,
      'payment-123'
    )
  ).rejects.toThrow()
})

test('reconciles verified provider facts without replacing the legacy order projection', async () => {
  const requestId = 'request-987'
  const timestamp = String(Math.floor(Date.now() / 1000))
  const paymentId = 'payment-987'
  const externalReference = 'purchase-987'
  const manifest = `id:${paymentId};request-id:${requestId};ts:${timestamp};`
  const signature = createHmac('sha256', process.env.MERCADOPAGO_WEBHOOK_SECRET ?? '')
    .update(manifest)
    .digest('hex')
  const useCase = new ReconcileMercadoPagoWebhookUseCase(
    { translateError: (code: string) => code } as never,
    {
      getPayment: async () => ({
        id: paymentId,
        status: 'approved',
        externalReference,
        amount: 2500,
        currency: 'ARS',
      }),
    } as never
  )

  await useCase.execute(
    { type: 'payment', data: { id: paymentId } },
    `ts=${timestamp},v1=${signature}`,
    requestId,
    paymentId
  )

  expect(repositories.reconcileMercadoPagoPayment).toHaveBeenCalledWith(
    expect.objectContaining({
      providerPaymentId: paymentId,
      providerStatus: 'approved',
      externalReference,
      amount: 2500,
      currency: 'ARS',
      payload: { type: 'payment', data: { id: paymentId } },
    })
  )
  expect(repositories.reconcileMercadoPagoPayment).toHaveBeenCalledTimes(1)
})
