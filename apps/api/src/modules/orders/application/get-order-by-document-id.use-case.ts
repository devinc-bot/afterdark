import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  findOrderByDocumentIdAndUserId,
  findPurchaseByDocumentIdAndUserId,
  findUserIdByDocumentId,
} from '@repo/db'
import { ORDER_ERROR_CODE } from '@repo/i18n'
import { TranslationService } from '@repo/i18n/server'
import {
  PAYMENT_STATUS,
  PAYMENT_ATTEMPT_STATUS,
  PURCHASE_STATUS,
  type OrderResponse,
} from '@repo/types'
import { toOrderResponse } from '../mappers/orders.mapper'

@Injectable()
export class GetOrderByDocumentIdUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(userDocumentId: string, orderDocumentId: string): Promise<OrderResponse> {
    const userId = await findUserIdByDocumentId(userDocumentId)
    const purchase = userId
      ? await findPurchaseByDocumentIdAndUserId(orderDocumentId, userId)
      : null
    if (purchase) {
      return {
        documentId: purchase.purchase.documentId,
        ticketId: purchase.ticketDocumentId,
        status:
          purchase.purchase.status === PURCHASE_STATUS.CONFIRMED
            ? PAYMENT_STATUS.COMPLETED
            : purchase.payment.status === PAYMENT_ATTEMPT_STATUS.REJECTED
              ? PAYMENT_STATUS.REJECTED
              : purchase.purchase.status === PURCHASE_STATUS.PENDING
                ? PAYMENT_STATUS.PENDING
                : PAYMENT_STATUS.CANCELLED,
        amount: purchase.purchase.totalAmount,
        quantity: purchase.purchaseItem.quantity,
        provider: purchase.payment.provider,
        paidAt: purchase.payment.paidAt,
        createdAt: purchase.purchase.createdAt,
        updatedAt: purchase.purchase.updatedAt,
      }
    }

    const order = userId ? await findOrderByDocumentIdAndUserId(orderDocumentId, userId) : null

    if (!order) throw new NotFoundException(this.ts.translateError(ORDER_ERROR_CODE.NOT_FOUND))

    return toOrderResponse(order)
  }
}
