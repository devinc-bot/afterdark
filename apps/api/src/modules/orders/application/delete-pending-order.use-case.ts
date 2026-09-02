import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import {
  deletePendingOrderByDocumentIdAndUserId,
  findOrderByDocumentIdAndUserId,
  findPendingPurchaseCancellation,
  findUserIdByDocumentId,
  releaseReservationOnce,
} from '@repo/db'
import { ORDER_ERROR_CODE } from '@repo/i18n/constants'
import { TranslationService } from '@repo/i18n/server'
import { INVENTORY_RESERVATION_STATUS, PAYMENT_STATUS, PURCHASE_STATUS } from '@repo/types'
import type { MercadoPagoCheckoutProPort } from '../../mercado-pago/mercado-pago-checkout-pro.port'
import { MERCADO_PAGO_CHECKOUT_PRO_PORT } from '../../mercado-pago/mercado-pago.tokens'

@Injectable()
export class DeletePendingOrderUseCase {
  constructor(
    @Inject(TranslationService) private readonly ts: TranslationService,
    @Inject(MERCADO_PAGO_CHECKOUT_PRO_PORT)
    private readonly mercadoPagoCheckoutPro: MercadoPagoCheckoutProPort
  ) {}

  async execute(userDocumentId: string, orderDocumentId: string): Promise<void> {
    const userId = await findUserIdByDocumentId(userDocumentId)
    if (!userId) {
      throw new NotFoundException(this.ts.translateError(ORDER_ERROR_CODE.NOT_FOUND))
    }

    const purchase = await findPendingPurchaseCancellation(orderDocumentId, userId)
    if (purchase) {
      try {
        if (purchase.payment.providerPreferenceId) {
          await this.mercadoPagoCheckoutPro.expirePreference(purchase.payment.providerPreferenceId)
        }
      } catch {
        throw new InternalServerErrorException(
          this.ts.translateError(ORDER_ERROR_CODE.DELETE_FAILED)
        )
      }

      const released = await releaseReservationOnce({
        reservationDocumentId: purchase.reservation.documentId,
        purchaseStatus: PURCHASE_STATUS.CANCELLED,
        reservationStatus: INVENTORY_RESERVATION_STATUS.RELEASED,
        now: new Date(),
      })
      if (released.transitioned) return

      throw new ConflictException(this.ts.translateError(ORDER_ERROR_CODE.DELETE_NOT_PENDING))
    }

    const order = await findOrderByDocumentIdAndUserId(orderDocumentId, userId)

    if (!order) {
      throw new NotFoundException(this.ts.translateError(ORDER_ERROR_CODE.NOT_FOUND))
    }
    if (order.status !== PAYMENT_STATUS.PENDING) {
      throw new ConflictException(this.ts.translateError(ORDER_ERROR_CODE.DELETE_NOT_PENDING))
    }

    try {
      if (order.externalOrderId) {
        await this.mercadoPagoCheckoutPro.expirePreference(order.externalOrderId)
      }
    } catch {
      throw new InternalServerErrorException(this.ts.translateError(ORDER_ERROR_CODE.DELETE_FAILED))
    }

    if (await deletePendingOrderByDocumentIdAndUserId(orderDocumentId, userId)) return

    const currentOrder = await findOrderByDocumentIdAndUserId(orderDocumentId, userId)
    if (!currentOrder) {
      throw new NotFoundException(this.ts.translateError(ORDER_ERROR_CODE.NOT_FOUND))
    }
    if (currentOrder.status !== PAYMENT_STATUS.PENDING) {
      throw new ConflictException(this.ts.translateError(ORDER_ERROR_CODE.DELETE_NOT_PENDING))
    }

    throw new InternalServerErrorException(this.ts.translateError(ORDER_ERROR_CODE.DELETE_FAILED))
  }
}
