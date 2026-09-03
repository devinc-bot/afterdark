import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import {
  attachProviderPreference,
  findPublicTicketByDocumentId,
  findUserIdByDocumentId,
  releaseReservationOnce,
  reserveSingleTicketCheckout,
} from '@repo/db'
import { API_PREFIX, API_ROUTES, CLIENT_ROUTES } from '@repo/common'
import { ORDER_ERROR_CODE } from '@repo/i18n'
import { TranslationService } from '@repo/i18n/server'
import {
  PAYMENT_PROVIDER,
  PAYMENT_CURRENCY,
  PAYMENT_STATUS,
  CHECKOUT_RESERVATION_DURATION_MS,
  INVENTORY_RESERVATION_STATUS,
  PURCHASE_STATUS,
  TICKET_STATUS,
  type CreateOrderResponse,
} from '@repo/types'
import type { CreateOrderInput } from '@repo/validators'
import { ENV } from '../../../config/env'
import type { MercadoPagoCheckoutProPort } from '../../mercado-pago/mercado-pago-checkout-pro.port'
import { MERCADO_PAGO_CHECKOUT_PRO_PORT } from '../../mercado-pago/mercado-pago.tokens'
import { arePlatformPaymentsConfigured, isTicketOnSale } from '../utils/orders'

@Injectable()
export class CreatePendingOrderUseCase {
  constructor(
    @Inject(TranslationService) private readonly ts: TranslationService,
    @Inject(MERCADO_PAGO_CHECKOUT_PRO_PORT)
    private readonly mercadoPagoCheckoutPro: MercadoPagoCheckoutProPort
  ) {}

  async execute(userDocumentId: string, input: CreateOrderInput): Promise<CreateOrderResponse> {
    if (!arePlatformPaymentsConfigured()) {
      throw new BadRequestException(this.ts.translateError(ORDER_ERROR_CODE.CHECKOUT_UNAVAILABLE))
    }

    const [ticket, userId] = await Promise.all([
      findPublicTicketByDocumentId(input.ticketId),
      findUserIdByDocumentId(userDocumentId),
    ])
    if (!ticket || ticket.status !== TICKET_STATUS.ACTIVE || !isTicketOnSale(ticket)) {
      throw new BadRequestException(this.ts.translateError(ORDER_ERROR_CODE.NOT_ON_SALE))
    }

    if (!userId) {
      throw new BadRequestException(this.ts.translateError(ORDER_ERROR_CODE.NOT_FOUND))
    }

    const now = new Date()
    const expiresAt = new Date(now.getTime() + CHECKOUT_RESERVATION_DURATION_MS)
    const checkout = await reserveSingleTicketCheckout({
      userId,
      ticketId: ticket.id,
      quantity: input.quantity,
      currency: PAYMENT_CURRENCY.ARS,
      expiresAt,
      now,
    })
    if (!checkout) {
      throw new BadRequestException(this.ts.translateError(ORDER_ERROR_CODE.OUT_OF_STOCK))
    }

    try {
      const preference = await this.mercadoPagoCheckoutPro.createPreference({
        externalReference: checkout.purchase.documentId,
        title: ticket.ticketType.name,
        quantity: checkout.purchaseItem.quantity,
        unitPrice: checkout.purchaseItem.unitPrice,
        notificationUrl: this.getWebhookUrl(),
        expiresAt: checkout.purchase.expiresAt ?? expiresAt,
        backUrls: this.getBackUrls(checkout.purchase.documentId),
      })
      const attachment = await attachProviderPreference({
        purchaseDocumentId: checkout.purchase.documentId,
        provider: PAYMENT_PROVIDER.MERCADO_PAGO,
        providerPreferenceId: preference.id,
        now,
      })
      if (attachment.outcome === 'not_attachable')
        throw new Error('Provider preference is not attachable')

      return {
        documentId: checkout.purchase.documentId,
        ticketId: ticket.documentId,
        status: PAYMENT_STATUS.PENDING,
        amount: checkout.purchase.totalAmount,
        quantity: checkout.purchaseItem.quantity,
        provider: PAYMENT_PROVIDER.MERCADO_PAGO,
        paidAt: null,
        createdAt: checkout.purchase.createdAt,
        updatedAt: checkout.purchase.updatedAt,
        checkoutUrl: preference.initPoint,
      }
    } catch {
      await releaseReservationOnce({
        reservationDocumentId: checkout.reservation.documentId,
        purchaseStatus: PURCHASE_STATUS.CANCELLED,
        reservationStatus: INVENTORY_RESERVATION_STATUS.RELEASED,
        now,
      })
      throw new BadRequestException(this.ts.translateError(ORDER_ERROR_CODE.CHECKOUT_FAILED))
    }
  }

  private getWebhookUrl(): string {
    return new URL(
      `/${API_PREFIX}${API_ROUTES.mercadoPago.prefix}${API_ROUTES.mercadoPago.path.webhook()}`,
      ENV.API_PUBLIC_URL
    ).toString()
  }

  private getBackUrls(orderDocumentId: string) {
    return {
      success: new URL(CLIENT_ROUTES.checkoutSuccess(orderDocumentId), ENV.WEB_URL).toString(),
      pending: new URL(CLIENT_ROUTES.checkoutPending(orderDocumentId), ENV.WEB_URL).toString(),
      failure: new URL(CLIENT_ROUTES.checkoutError(orderDocumentId), ENV.WEB_URL).toString(),
    }
  }
}
