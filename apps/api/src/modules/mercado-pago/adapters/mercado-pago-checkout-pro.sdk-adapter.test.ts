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

test('expires a Checkout Pro preference with its existing items', async () => {
  const originalFetch = globalThis.fetch
  const requests: Array<{ body: unknown; method: string | undefined; url: string }> = []
  globalThis.fetch = (async (input, init) => {
    requests.push({
      url: String(input),
      method: init?.method,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    })

    if (init?.method === 'PUT') {
      return Response.json({ id: 'preference-123' })
    }

    return Response.json({
      id: 'preference-123',
      items: [{ id: 'order-123', title: 'Entrada general', quantity: 2, unit_price: 2500 }],
    })
  }) as typeof fetch

  try {
    const { MercadoPagoCheckoutProSdkAdapter } = await adapterModulePromise
    const adapter = new MercadoPagoCheckoutProSdkAdapter()

    await adapter.expirePreference('preference-123')

    assert.equal(requests.length, 2)
    assert.deepEqual(requests[0], {
      url: 'https://api.mercadopago.com/checkout/preferences/preference-123',
      method: undefined,
      body: undefined,
    })
    const updateBody = requests[1]?.body as {
      items: unknown
      expires: unknown
      expiration_date_to: unknown
    }
    assert.deepEqual(updateBody.items, [
      { id: 'order-123', title: 'Entrada general', quantity: 2, unit_price: 2500 },
    ])
    assert.equal(updateBody.expires, true)
    assert.ok(typeof updateBody.expiration_date_to === 'string')
    assert.match(updateBody.expiration_date_to, /^\d{4}-\d{2}-\d{2}T/)
    assert.equal(requests[1]?.method, 'PUT')
    assert.equal(
      requests[1]?.url,
      'https://api.mercadopago.com/checkout/preferences/preference-123'
    )
    assert.match(
      (requests[1]?.body as { expiration_date_to: string }).expiration_date_to,
      /^\d{4}-\d{2}-\d{2}T/
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('does not update a preference without items', async () => {
  const originalFetch = globalThis.fetch
  const requests: string[] = []
  globalThis.fetch = (async (input) => {
    requests.push(String(input))
    return Response.json({ id: 'preference-123' })
  }) as typeof fetch

  try {
    const { MercadoPagoCheckoutProSdkAdapter } = await adapterModulePromise
    const adapter = new MercadoPagoCheckoutProSdkAdapter()

    await assert.rejects(
      () => adapter.expirePreference('preference-123'),
      /Mercado Pago preference response is missing items/
    )
    assert.deepEqual(requests, ['https://api.mercadopago.com/checkout/preferences/preference-123'])
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('propagates a Mercado Pago preference expiration failure', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = (async (_input, init) => {
    if (init?.method === 'PUT') {
      return Response.json({ message: 'Provider unavailable' }, { status: 500 })
    }

    return Response.json({
      id: 'preference-123',
      items: [{ id: 'order-123', title: 'Entrada general', quantity: 2, unit_price: 2500 }],
    })
  }) as typeof fetch

  try {
    const { MercadoPagoCheckoutProSdkAdapter } = await adapterModulePromise
    const adapter = new MercadoPagoCheckoutProSdkAdapter()

    await assert.rejects(() => adapter.expirePreference('preference-123'))
  } finally {
    globalThis.fetch = originalFetch
  }
})
