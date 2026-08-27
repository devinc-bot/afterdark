import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { fetchTicketTypes } from '~/modules/ticket-types/service/ticket-types.service'

export function useTicketTypes() {
  return useQuery({
    queryKey: QUERY_KEYS.ticketTypes(),
    queryFn: fetchTicketTypes,
  })
}
