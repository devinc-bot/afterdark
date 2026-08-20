import type { ScannedTicketHistoryResponse, TicketCheckInResponse } from '@repo/types'
import type { ListScannedTicketsQueryInput, TicketCheckInInput } from '@repo/validators'
import { buildApiPath, toApiServiceError } from '@repo/common'
import { i18n } from '@repo/i18n/client'
import { api, API_ROUTES } from '~/config/api'

export function checkInTicket(input: TicketCheckInInput): Promise<TicketCheckInResponse> {
  return api.post<TicketCheckInResponse>(
    buildApiPath(API_ROUTES.tickets, API_ROUTES.tickets.path.checkIns()),
    input
  )
}

export async function fetchScannedTicketsHistory(
  params: ListScannedTicketsQueryInput
): Promise<ScannedTicketHistoryResponse> {
  try {
    const searchParams = new URLSearchParams({
      eventId: params.eventId,
      page: String(params.page),
      limit: String(params.limit),
    })

    return await api.get<ScannedTicketHistoryResponse>(
      `${buildApiPath(API_ROUTES.tickets, API_ROUTES.tickets.path.checkInHistory())}?${searchParams.toString()}`
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('dashboard:pages.qrTicket.history.error'))
  }
}
