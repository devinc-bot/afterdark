import { buildApiPath, toApiServiceError } from '@repo/common'
import type { BuyerOrderSummaryResponse, PaginatedResponse } from '@repo/types'
import { i18n } from '@repo/i18n/client'
import { api, API_ROUTES } from '~/config/api'

export const ORDERS_FIRST_PAGE = 1
export const ORDERS_PAGE_SIZE = 10

export type FetchOrdersParams = {
  page?: number
  limit?: number
}

export async function fetchOrders(
  params: FetchOrdersParams = {}
): Promise<PaginatedResponse<BuyerOrderSummaryResponse>> {
  const searchParams = new URLSearchParams({
    page: String(params.page ?? ORDERS_FIRST_PAGE),
    limit: String(params.limit ?? ORDERS_PAGE_SIZE),
  })
  const path = buildApiPath(API_ROUTES.orders, API_ROUTES.orders.path.list())

  try {
    return await api.get<PaginatedResponse<BuyerOrderSummaryResponse>>(
      `${path}?${searchParams.toString()}`
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('errors:order.LIST_FAILED'))
  }
}

export async function deleteOrder(orderDocumentId: string): Promise<void> {
  const path = buildApiPath(API_ROUTES.orders, API_ROUTES.orders.path.delete(orderDocumentId))

  try {
    await api.delete<void>(path)
  } catch (error) {
    throw toApiServiceError(error, i18n.t('errors:order.DELETE_FAILED'))
  }
}
