import type {
  ClubResponse,
  EventResponse,
  OwnerSaleResponse,
  PaginatedResponse,
} from '@afterdark/types'
import type { ListOwnerSalesQueryInput } from '@afterdark/validators'
import { i18n } from '@afterdark/i18n/client'
import { api, API_ROUTES } from '~/config/api'
import { buildApiPath, toApiServiceError } from '@afterdark/common'

function toSalesSearchParams(params: ListOwnerSalesQueryInput): string {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  })

  if (params.eventId) searchParams.set('eventId', params.eventId)
  if (params.clubId) searchParams.set('clubId', params.clubId)
  if (params.ticketType) searchParams.set('ticketType', params.ticketType)
  if (params.from) searchParams.set('from', params.from.toISOString())
  if (params.to) searchParams.set('to', params.to.toISOString())

  return searchParams.toString()
}

export async function fetchOwnerSales(
  params: ListOwnerSalesQueryInput
): Promise<PaginatedResponse<OwnerSaleResponse>> {
  const query = toSalesSearchParams(params)
  const path = buildApiPath(API_ROUTES.dashboard, API_ROUTES.dashboard.path.sales())

  try {
    return await api.get<PaginatedResponse<OwnerSaleResponse>>(`${path}?${query}`)
  } catch (error) {
    throw toApiServiceError(error, i18n.t('sales:list.error'))
  }
}

export async function fetchSalesFilterClubs(): Promise<ClubResponse[]> {
  try {
    return await api.get<ClubResponse[]>(
      buildApiPath(API_ROUTES.clubs, API_ROUTES.clubs.path.list())
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('sales:filters.clubsError'))
  }
}

export async function fetchSalesFilterEvents(): Promise<EventResponse[]> {
  const searchParams = new URLSearchParams({ page: '1', limit: '100' })

  try {
    const response = await api.get<PaginatedResponse<EventResponse>>(
      `${buildApiPath(API_ROUTES.events, API_ROUTES.events.path.list())}?${searchParams.toString()}`
    )
    return response.data
  } catch (error) {
    throw toApiServiceError(error, i18n.t('sales:filters.eventsError'))
  }
}
