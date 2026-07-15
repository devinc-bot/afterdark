import type { PaginatedResponse, TicketResponse } from '@afterdark/types'
import type {
  CreateTicketInput,
  ListTicketsQueryInput,
  UpdateTicketInput,
} from '@afterdark/validators'
import { i18n } from '@afterdark/i18n/client'
import { api, API_ROUTES } from '~/config/api'
import { buildApiPath, toApiServiceError } from '@afterdark/common'

export async function fetchTickets(
  params: ListTicketsQueryInput
): Promise<PaginatedResponse<TicketResponse>> {
  try {
    const searchParams = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit),
    })

    if (params.status) {
      searchParams.set('status', params.status)
    }

    if (params.clubId) {
      searchParams.set('clubId', params.clubId)
    }

    return await api.get<PaginatedResponse<TicketResponse>>(
      `${buildApiPath(API_ROUTES.tickets, API_ROUTES.tickets.path.list())}?${searchParams.toString()}`
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('tickets:list.error'))
  }
}

export async function createTicket(input: CreateTicketInput): Promise<TicketResponse> {
  try {
    return await api.post<TicketResponse>(
      buildApiPath(API_ROUTES.tickets, API_ROUTES.tickets.path.create()),
      input
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('tickets:form.errorCreateFallback'))
  }
}

export async function updateTicket(
  documentId: string,
  input: UpdateTicketInput
): Promise<TicketResponse> {
  try {
    return await api.patch<TicketResponse>(
      buildApiPath(API_ROUTES.tickets, API_ROUTES.tickets.path.update(documentId)),
      input
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('tickets:form.errorEditFallback'))
  }
}

export async function deleteTicket(documentId: string): Promise<void> {
  try {
    await api.delete(buildApiPath(API_ROUTES.tickets, API_ROUTES.tickets.path.delete(documentId)))
  } catch (error) {
    throw toApiServiceError(error, i18n.t('tickets:delete.errorFallback'))
  }
}
