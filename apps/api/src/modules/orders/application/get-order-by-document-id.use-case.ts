import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  findOrderByDocumentIdAndUserId,
  findPurchaseByDocumentIdAndUserId,
  findUserIdByDocumentId,
} from '@repo/db'
import { ORDER_ERROR_CODE } from '@repo/i18n'
import { TranslationService } from '@repo/i18n/server'
import { type OrderResponse } from '@repo/types'
import { toLegacyPaymentStatus, toOrderResponse } from '../mappers/orders.mapper'

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
        status: toLegacyPaymentStatus(purchase.purchase.status, purchase.payment.status),
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
