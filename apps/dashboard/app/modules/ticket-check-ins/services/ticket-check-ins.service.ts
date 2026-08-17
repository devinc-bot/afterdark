import type { TicketCheckInResponse } from '@repo/types'
import type { TicketCheckInInput } from '@repo/validators'
import { buildApiPath } from '@repo/common'
import { api, API_ROUTES } from '~/config/api'

export function checkInTicket(input: TicketCheckInInput): Promise<TicketCheckInResponse> {
  return api.post<TicketCheckInResponse>(
    buildApiPath(API_ROUTES.tickets, API_ROUTES.tickets.path.checkIns()),
    input
  )
}
