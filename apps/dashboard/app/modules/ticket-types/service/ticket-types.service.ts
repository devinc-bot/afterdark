import type { TicketTypeResponse } from '@repo/types'
import type { CreateTicketTypeInput } from '@repo/validators'
import { i18n } from '@repo/i18n/client'
import { buildApiPath, toApiServiceError } from '@repo/common'
import { api, API_ROUTES } from '~/config/api'

export async function fetchTicketTypes(): Promise<TicketTypeResponse[]> {
  try {
    return await api.get<TicketTypeResponse[]>(
      buildApiPath(API_ROUTES.ticketTypes, API_ROUTES.ticketTypes.path.list())
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('tickets:ticketTypes.loadError'))
  }
}

export async function createTicketType(input: CreateTicketTypeInput): Promise<TicketTypeResponse> {
  try {
    return await api.post<TicketTypeResponse>(
      buildApiPath(API_ROUTES.ticketTypes, API_ROUTES.ticketTypes.path.create()),
      input
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('tickets:ticketTypes.createError'))
  }
}
