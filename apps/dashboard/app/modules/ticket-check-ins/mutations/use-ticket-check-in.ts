import { useMutation } from '@tanstack/react-query'
import type { TicketCheckInInput } from '@repo/validators'
import { checkInTicket } from '../services/ticket-check-ins.service'

export function useTicketCheckIn() {
  return useMutation({
    mutationFn: (input: TicketCheckInInput) => checkInTicket(input),
  })
}
