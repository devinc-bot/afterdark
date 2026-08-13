import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { findOrderByDocumentIdAndUserId, findUserIdByDocumentId } from '@repo/db'
import { ORDER_ERROR_CODE } from '@repo/i18n'
import { TranslationService } from '@repo/i18n/server'
import type { OrderResponse } from '@repo/types'
import { toOrderResponse } from '../mappers/orders.mapper'

@Injectable()
export class GetOrderByDocumentIdUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(userDocumentId: string, orderDocumentId: string): Promise<OrderResponse> {
    const userId = await findUserIdByDocumentId(userDocumentId)
    const order = userId ? await findOrderByDocumentIdAndUserId(orderDocumentId, userId) : null

    if (!order) throw new NotFoundException(this.ts.translateError(ORDER_ERROR_CODE.NOT_FOUND))

    return toOrderResponse(order)
  }
}
