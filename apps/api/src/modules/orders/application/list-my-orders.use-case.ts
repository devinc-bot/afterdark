import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { findOrdersPaginatedByUserDocumentId } from '@repo/db'
import { ORDER_ERROR_CODE } from '@repo/i18n/constants'
import { TranslationService } from '@repo/i18n/server'
import type { BuyerOrderSummaryResponse, PaginatedResponse } from '@repo/types'
import type { ListOrdersQueryInput } from '@repo/validators'
import { toBuyerOrderSummaryResponse } from '../mappers/orders.mapper'

@Injectable()
export class ListMyOrdersUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(
    userDocumentId: string,
    query: ListOrdersQueryInput
  ): Promise<PaginatedResponse<BuyerOrderSummaryResponse>> {
    try {
      const { rows, total } = await findOrdersPaginatedByUserDocumentId({
        userDocumentId,
        page: query.page,
        limit: query.limit,
      })

      return {
        data: rows.map(toBuyerOrderSummaryResponse),
        total,
        page: query.page,
        limit: query.limit,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
      }
    } catch {
      throw new InternalServerErrorException(this.ts.translateError(ORDER_ERROR_CODE.LIST_FAILED))
    }
  }
}
