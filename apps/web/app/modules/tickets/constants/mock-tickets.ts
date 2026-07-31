export type MockTicketStatus = 'valid' | 'used'

export type MockTicket = {
  id: string
  eventName: string
  coverUrl: string | null
  startsAt: string
  venue: string
  ticketType: string
  quantity: number
  status: MockTicketStatus
}

/** Local mock purchases — replace with API later. Always ≥1 valid and ≥1 used. */
export const MOCK_TICKETS: readonly MockTicket[] = [
  {
    id: 'mock-ticket-1',
    eventName: 'Noche Neón · After Hours',
    coverUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    startsAt: '2026-08-15T23:00:00.000-03:00',
    venue: 'Club Horizon, Palermo',
    ticketType: 'General',
    quantity: 2,
    status: 'valid',
  },
  {
    id: 'mock-ticket-2',
    eventName: 'Sunset Sessions',
    coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    startsAt: '2026-07-12T18:30:00.000-03:00',
    venue: 'Terraza Norte, Belgrano',
    ticketType: 'VIP',
    quantity: 1,
    status: 'used',
  },
  {
    id: 'mock-ticket-3',
    eventName: 'Warehouse Collective',
    coverUrl: null,
    startsAt: '2026-09-05T22:00:00.000-03:00',
    venue: 'Depósito Sur, La Boca',
    ticketType: 'Early bird',
    quantity: 4,
    status: 'valid',
  },
] as const
