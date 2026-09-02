import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  findOrdersPaginatedByUserDocumentId,
  findPurchasesPaginatedByUserDocumentId,
} from '@repo/db'
import { ORDER_ERROR_CODE } from '@repo/i18n/constants'
import { TranslationService } from '@repo/i18n/server'
import type { BuyerOrderSummaryResponse, PaginatedResponse } from '@repo/types'
import type { ListOrdersQueryInput } from '@repo/validators'
import {
  toBuyerOrderSummaryResponse,
  toBuyerPurchaseSummaryResponse,
} from '../mappers/orders.mapper'

@Injectable()
export class ListMyOrdersUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(
    userDocumentId: string,
    query: ListOrdersQueryInput
  ): Promise<PaginatedResponse<BuyerOrderSummaryResponse>> {
    try {
      const result = await findOrderHistory(userDocumentId, query.page, query.limit)

      return {
        data: result.rows,
        total: result.total,
        page: query.page,
        limit: query.limit,
        totalPages: result.total === 0 ? 0 : Math.ceil(result.total / query.limit),
      }
    } catch {
      throw new InternalServerErrorException(this.ts.translateError(ORDER_ERROR_CODE.LIST_FAILED))
    }
  }
}

async function findOrderHistory(userDocumentId: string, page: number, limit: number) {
  const params = { userDocumentId, page, limit }
  const [purchasePage, legacyPage] = await Promise.all([
    findPurchasesPaginatedByUserDocumentId(params),
    findOrdersPaginatedByUserDocumentId(params),
  ])

  if (purchasePage.total === 0) {
    return { rows: legacyPage.rows.map(toBuyerOrderSummaryResponse), total: legacyPage.total }
  }
  if (legacyPage.total === 0) {
    return {
      rows: purchasePage.rows.map(toBuyerPurchaseSummaryResponse),
      total: purchasePage.total,
    }
  }

  const [purchases, legacyOrders] = await Promise.all([
    getAllPurchaseRows(userDocumentId, purchasePage),
    getAllLegacyOrderRows(userDocumentId, legacyPage),
  ])
  const ordersByDocumentId = new Map(
    legacyOrders.rows.map((order) => {
      const response = toBuyerOrderSummaryResponse(order)
      return [response.documentId, response]
    })
  )

  for (const purchase of purchases.rows) {
    const response = toBuyerPurchaseSummaryResponse(purchase)
    ordersByDocumentId.set(response.documentId, response)
  }

  const rows = [...ordersByDocumentId.values()].sort(
    (left, right) =>
      right.createdAt.getTime() - left.createdAt.getTime() ||
      right.documentId.localeCompare(left.documentId)
  )
  const offset = (page - 1) * limit

  return { rows: rows.slice(offset, offset + limit), total: rows.length }
}

async function getAllPurchaseRows(
  userDocumentId: string,
  initialPage: Awaited<ReturnType<typeof findPurchasesPaginatedByUserDocumentId>>
) {
  if (initialPage.total <= initialPage.rows.length) return initialPage

  return findPurchasesPaginatedByUserDocumentId({
    userDocumentId,
    page: 1,
    limit: initialPage.total,
  })
}

async function getAllLegacyOrderRows(
  userDocumentId: string,
  initialPage: Awaited<ReturnType<typeof findOrdersPaginatedByUserDocumentId>>
) {
  if (initialPage.total <= initialPage.rows.length) return initialPage

  return findOrdersPaginatedByUserDocumentId({
    userDocumentId,
    page: 1,
    limit: initialPage.total,
  })
}
