import { useQuery } from '@tanstack/react-query'
import { TICKET_STATUS } from '@afterdark/types'
import type { ListTicketsQueryInput } from '@afterdark/validators'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { fetchTickets } from '~/modules/tickets/service/tickets.service'

const DEFAULT_TICKETS_QUERY: ListTicketsQueryInput = {
  page: 1,
  limit: 10,
}

export function useTickets(params: Partial<ListTicketsQueryInput> = {}) {
  const query = { ...DEFAULT_TICKETS_QUERY, ...params }

  return useQuery({
    queryKey: QUERY_KEYS.tickets(query),
    queryFn: () => fetchTickets(query),
  })
}

export function useActiveTickets() {
  return useTickets({ status: TICKET_STATUS.ACTIVE })
}

export function useArchivedTickets() {
  return useTickets({ status: TICKET_STATUS.INACTIVE })
}
