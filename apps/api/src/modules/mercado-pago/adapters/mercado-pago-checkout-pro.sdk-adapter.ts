import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'
import { Injectable } from '@nestjs/common'
import { ENV } from '../../../config/env'
import type {
  CreateMercadoPagoPreferenceInput,
  MercadoPagoCheckoutProPort,
  MercadoPagoPaymentResult,
  MercadoPagoPreferenceResult,
} from '../mercado-pago-checkout-pro.port'

@Injectable()
export class MercadoPagoCheckoutProSdkAdapter implements MercadoPagoCheckoutProPort {
  private readonly payment: Payment
  private readonly preference: Preference

  constructor() {
    const config = new MercadoPagoConfig({ accessToken: ENV.MERCADOPAGO_ACCESS_TOKEN })
    this.payment = new Payment(config)
    this.preference = new Preference(config)
  }

  async createPreference(
    input: CreateMercadoPagoPreferenceInput
  ): Promise<MercadoPagoPreferenceResult> {
    const response = await this.preference.create({
      body: {
        items: [
          {
            id: input.externalReference,
            title: input.title,
            quantity: input.quantity,
            unit_price: input.unitPrice,
          },
        ],
        external_reference: input.externalReference,
        notification_url: input.notificationUrl,
        back_urls: input.backUrls,
        auto_return: 'approved',
      },
    })
    const initPoint = ENV.MERCADOPAGO_TEST_MODE ? response.sandbox_init_point : response.init_point
    if (response.id === undefined || !initPoint) {
      throw new Error('Mercado Pago preference response is missing id or init point')
    }

    return { id: String(response.id), initPoint }
  }

  async expirePreference(preferenceId: string): Promise<void> {
    const preference = await this.preference.get({ preferenceId })
    if (!preference.items?.length) {
      throw new Error('Mercado Pago preference response is missing items')
    }

    await this.preference.update({
      id: preferenceId,
      updatePreferenceRequest: {
        items: preference.items,
        expires: true,
        expiration_date_to: new Date().toISOString(),
      },
    })
  }

  async getPayment(paymentId: string): Promise<MercadoPagoPaymentResult> {
    const response = await this.payment.get({ id: paymentId })
    if (response.id === undefined || !response.status) {
      throw new Error('Mercado Pago payment response is missing id or status')
    }

    return {
      id: String(response.id),
      status: response.status,
      externalReference: response.external_reference ?? null,
    }
  }
}
