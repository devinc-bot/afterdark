import { buildApiPath, toApiServiceError } from '@repo/common'
import type {
  PaginatedResponse,
  PurchasedTicketQrResponse,
  PurchasedTicketResponse,
} from '@repo/types'
import { i18n } from '@repo/i18n/client'
import { api, API_ROUTES } from '~/config/api'

export const PURCHASED_TICKETS_FIRST_PAGE = 1
export const PURCHASED_TICKETS_PAGE_SIZE = 10

export type FetchPurchasedTicketsParams = {
  page?: number
  limit?: number
}

export async function fetchPurchasedTickets(
  params: FetchPurchasedTicketsParams = {}
): Promise<PaginatedResponse<PurchasedTicketResponse>> {
  const searchParams = new URLSearchParams({
    page: String(params.page ?? PURCHASED_TICKETS_FIRST_PAGE),
    limit: String(params.limit ?? PURCHASED_TICKETS_PAGE_SIZE),
  })
  const path = buildApiPath(API_ROUTES.tickets, API_ROUTES.tickets.path.purchased())

  try {
    return await api.get<PaginatedResponse<PurchasedTicketResponse>>(
      `${path}?${searchParams.toString()}`
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('tickets:mine.states.error'))
  }
}

export async function fetchPurchasedTicketQr(
  ticketSoldDocumentId: string
): Promise<PurchasedTicketQrResponse> {
  const path = buildApiPath(
    API_ROUTES.tickets,
    API_ROUTES.tickets.path.purchasedQr(ticketSoldDocumentId)
  )

  try {
    return await api.get<PurchasedTicketQrResponse>(path)
  } catch (error) {
    throw toApiServiceError(error, i18n.t('tickets:mine.qrDialog.error'))
  }
}
