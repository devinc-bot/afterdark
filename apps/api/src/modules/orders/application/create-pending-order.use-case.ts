import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import {
  countCompletedSoldQuantityByTicketId,
  createOrder,
  findPublicTicketByDocumentId,
  findUserIdByDocumentId,
  updateOrderById,
} from '@repo/db'
import { API_PREFIX, API_ROUTES, CLIENT_ROUTES } from '@repo/common'
import { ORDER_ERROR_CODE } from '@repo/i18n'
import { TranslationService } from '@repo/i18n/server'
import {
  PAYMENT_PROVIDER,
  PAYMENT_STATUS,
  TICKET_STATUS,
  type CreateOrderResponse,
} from '@repo/types'
import type { CreateOrderInput } from '@repo/validators'
import { ENV } from '../../../config/env'
import type { MercadoPagoCheckoutProPort } from '../../mercado-pago/mercado-pago-checkout-pro.port'
import { MERCADO_PAGO_CHECKOUT_PRO_PORT } from '../../mercado-pago/mercado-pago.tokens'
import { arePlatformPaymentsConfigured, isTicketOnSale } from '../utils/orders'
import { toOrderResponse } from '../mappers/orders.mapper'

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

    const soldQuantity = await countCompletedSoldQuantityByTicketId(ticket.id)
    if (ticket.quantity - soldQuantity < input.quantity) {
      throw new BadRequestException(this.ts.translateError(ORDER_ERROR_CODE.OUT_OF_STOCK))
    }

    const order = await createOrder({
      ticketId: ticket.id,
      userId,
      amount: ticket.price * input.quantity,
      quantity: input.quantity,
      status: PAYMENT_STATUS.PENDING,
      provider: PAYMENT_PROVIDER.MERCADO_PAGO,
    })

    try {
      const preference = await this.mercadoPagoCheckoutPro.createPreference({
        externalReference: order.documentId,
        title: ticket.name,
        quantity: order.quantity,
        unitPrice: ticket.price,
        notificationUrl: this.getWebhookUrl(),
        backUrls: this.getBackUrls(order.documentId),
      })
      const updatedOrder = await updateOrderById(order.id, { externalOrderId: preference.id })
      if (!updatedOrder) throw new Error('Order update returned no row')

      return { ...toOrderResponse(updatedOrder), checkoutUrl: preference.initPoint }
    } catch {
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
