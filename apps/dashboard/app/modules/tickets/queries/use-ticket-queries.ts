import { useQuery } from '@tanstack/react-query'
import { TICKET_STATUS } from '@repo/types'
import type { ListTicketsQueryInput } from '@repo/validators'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { fetchTicket, fetchTickets } from '~/modules/tickets/service/tickets.service'

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

export function useTicket(documentId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ticket(documentId),
    queryFn: () => fetchTicket(documentId),
    enabled: Boolean(documentId),
  })
}

export function useActiveTickets() {
  return useTickets({ status: TICKET_STATUS.ACTIVE })
}

export function useArchivedTickets() {
  return useTickets({ status: TICKET_STATUS.INACTIVE })
}
