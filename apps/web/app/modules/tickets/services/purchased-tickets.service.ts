import { buildApiPath, toApiServiceError } from '@repo/common'
import type { PurchasedTicketResponse } from '@repo/types'
import { i18n } from '@repo/i18n/client'
import { api, API_ROUTES } from '~/config/api'

export async function fetchPurchasedTickets(): Promise<PurchasedTicketResponse[]> {
  const path = buildApiPath(API_ROUTES.tickets, API_ROUTES.tickets.path.purchased())

  try {
    return await api.get<PurchasedTicketResponse[]>(path)
  } catch (error) {
    throw toApiServiceError(error, i18n.t('tickets:mine.states.error'))
  }
}
