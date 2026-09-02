import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { WebhookSignatureValidator } from 'mercadopago'
import { reconcileMercadoPagoPayment } from '@repo/db'
import { TranslationService } from '@repo/i18n/server'
import { MERCADO_PAGO_NOTIFICATION_TYPE, type MercadoPagoNotificationType } from '@repo/types'
import { ENV } from '../../../config/env'
import type { MercadoPagoCheckoutProPort } from '../mercado-pago-checkout-pro.port'
import { MERCADO_PAGO_CHECKOUT_PRO_PORT } from '../mercado-pago.tokens'

const WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS = 5 * 60

type MercadoPagoWebhookPayload = {
  data?: { id?: string | number }
  resource?: string
  topic?: string
  type?: MercadoPagoNotificationType | string
}

function isPaymentWebhook(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false
  const value = body as MercadoPagoWebhookPayload
  const notificationType = value.type ?? value.topic
  return notificationType === MERCADO_PAGO_NOTIFICATION_TYPE.PAYMENT
}

function getPaymentId(body: unknown, queryPaymentId: string | undefined): string | undefined {
  if (queryPaymentId) return queryPaymentId
  if (!body || typeof body !== 'object') return undefined

  const { data, resource } = body as MercadoPagoWebhookPayload
  const paymentId = data?.id ?? resource
  if (paymentId === undefined) return undefined

  return String(paymentId).split('/').at(-1)
}

@Injectable()
export class ReconcileMercadoPagoWebhookUseCase {
  constructor(
    @Inject(TranslationService) private readonly ts: TranslationService,
    @Inject(MERCADO_PAGO_CHECKOUT_PRO_PORT)
    private readonly mercadoPagoCheckoutPro: MercadoPagoCheckoutProPort
  ) {}

  async execute(
    body: unknown,
    signature: string | undefined,
    requestId: string | undefined,
    dataId: string | undefined
  ): Promise<void> {
    const paymentId = getPaymentId(body, dataId)
    if (
      !paymentId ||
      !isPaymentWebhook(body) ||
      !this.isSignatureValid(dataId, signature, requestId)
    ) {
      throw new ForbiddenException(this.ts.translateError('order.WEBHOOK_INVALID'))
    }

    const providerPayment = await this.mercadoPagoCheckoutPro.getPayment(paymentId)
    if (!providerPayment.externalReference) return

    await reconcileMercadoPagoPayment({
      providerPaymentId: providerPayment.id,
      providerStatus: providerPayment.status,
      externalReference: providerPayment.externalReference,
      amount: providerPayment.amount,
      currency: providerPayment.currency,
      payload: body as Record<string, unknown>,
      now: new Date(),
    })
  }

  private isSignatureValid(
    dataId: string | undefined,
    signature: string | undefined,
    requestId: string | undefined
  ): boolean {
    try {
      WebhookSignatureValidator.validate({
        xSignature: signature,
        xRequestId: requestId,
        dataId,
        secret: ENV.MERCADOPAGO_WEBHOOK_SECRET,
        toleranceSeconds: WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS,
      })
      return true
    } catch {
      return false
    }
  }
}
