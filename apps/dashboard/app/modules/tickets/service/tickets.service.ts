import type { PaginatedResponse, TicketResponse } from '@afterdark/types'
import type {
  CreateTicketInput,
  ListTicketsQueryInput,
  UpdateTicketInput,
} from '@afterdark/validators'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/constants/api'
import { toApiServiceError } from '~/modules/common/utils/api-service-error.utils'

const LIST_TICKETS_FALLBACK_ERROR =
  'No pudimos cargar los tickets. Intentá de nuevo en unos minutos.'
const CREATE_TICKET_FALLBACK_ERROR = 'No pudimos crear el ticket. Intentá de nuevo en unos minutos.'
const UPDATE_TICKET_FALLBACK_ERROR =
  'No pudimos actualizar el ticket. Intentá de nuevo en unos minutos.'
const DELETE_TICKET_FALLBACK_ERROR =
  'No pudimos eliminar el ticket. Intentá de nuevo en unos minutos.'

function ticketsApiPath(path: string) {
  return `${API_ROUTES.tickets.prefix}${path}`
}

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
      `${ticketsApiPath(API_ROUTES.tickets.path.list())}?${searchParams.toString()}`
    )
  } catch (error) {
    throw toApiServiceError(error, LIST_TICKETS_FALLBACK_ERROR)
  }
}

export async function createTicket(input: CreateTicketInput): Promise<TicketResponse> {
  try {
    return await api.post<TicketResponse>(ticketsApiPath(API_ROUTES.tickets.path.create()), input)
  } catch (error) {
    throw toApiServiceError(error, CREATE_TICKET_FALLBACK_ERROR)
  }
}

export async function updateTicket(
  documentId: string,
  input: UpdateTicketInput
): Promise<TicketResponse> {
  try {
    return await api.patch<TicketResponse>(
      ticketsApiPath(API_ROUTES.tickets.path.update(documentId)),
      input
    )
  } catch (error) {
    throw toApiServiceError(error, UPDATE_TICKET_FALLBACK_ERROR)
  }
}

export async function deleteTicket(documentId: string): Promise<void> {
  try {
    await api.delete(ticketsApiPath(API_ROUTES.tickets.path.delete(documentId)))
  } catch (error) {
    throw toApiServiceError(error, DELETE_TICKET_FALLBACK_ERROR)
  }
}
