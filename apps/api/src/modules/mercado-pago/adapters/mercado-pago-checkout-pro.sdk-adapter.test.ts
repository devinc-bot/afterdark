import assert from 'node:assert/strict'
import test from 'node:test'

process.env.MERCADOPAGO_ACCESS_TOKEN = 'test-access-token'
process.env.MERCADOPAGO_TEST_MODE = 'false'

const adapterModulePromise = import('./mercado-pago-checkout-pro.sdk-adapter.ts')

test('creates a Checkout Pro preference with the Mercado Pago SDK', async () => {
  const originalFetch = globalThis.fetch
  const requests: Array<{ body: unknown; headers: HeadersInit | undefined; url: string }> = []
  globalThis.fetch = (async (input, init) => {
    requests.push({
      url: String(input),
      headers: init?.headers,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    })
    return Response.json({
      id: 'preference-123',
      init_point: 'https://checkout.mercadopago.com/123',
    })
  }) as typeof fetch

  try {
    const { MercadoPagoCheckoutProSdkAdapter } = await adapterModulePromise
    const adapter = new MercadoPagoCheckoutProSdkAdapter()
    const result = await adapter.createPreference({
      externalReference: 'order-123',
      title: 'Entrada general',
      quantity: 2,
      unitPrice: 2500,
      notificationUrl: 'https://api.afterdark.test/api/mercado-pago/webhook',
      backUrls: {
        success: 'https://afterdark.test/checkout/order-123/success',
        pending: 'https://afterdark.test/checkout/order-123/pending',
        failure: 'https://afterdark.test/checkout/order-123/error',
      },
    })

    assert.deepEqual(result, {
      id: 'preference-123',
      initPoint: 'https://checkout.mercadopago.com/123',
    })
    assert.equal(requests.length, 1)
    assert.equal(requests[0]?.url, 'https://api.mercadopago.com/checkout/preferences/')
    assert.equal(new Headers(requests[0]?.headers).get('authorization'), 'Bearer test-access-token')
    assert.deepEqual(requests[0]?.body, {
      items: [{ id: 'order-123', title: 'Entrada general', quantity: 2, unit_price: 2500 }],
      external_reference: 'order-123',
      notification_url: 'https://api.afterdark.test/api/mercado-pago/webhook',
      back_urls: {
        success: 'https://afterdark.test/checkout/order-123/success',
        pending: 'https://afterdark.test/checkout/order-123/pending',
        failure: 'https://afterdark.test/checkout/order-123/error',
      },
      auto_return: 'approved',
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('retrieves a payment with the Mercado Pago SDK', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = (async () =>
    Response.json({
      id: 456,
      status: 'approved',
      external_reference: 'order-123',
    })) as typeof fetch

  try {
    const { MercadoPagoCheckoutProSdkAdapter } = await adapterModulePromise
    const adapter = new MercadoPagoCheckoutProSdkAdapter()
    const result = await adapter.getPayment('456')

    assert.deepEqual(result, {
      id: '456',
      status: 'approved',
      externalReference: 'order-123',
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})
