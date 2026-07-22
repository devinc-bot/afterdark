import { CalendarDays, Ticket, Users, ShoppingBag, type LucideIcon } from 'lucide-react'

export const LANDING_FEATURES = [
  { key: 'events', icon: CalendarDays },
  { key: 'tickets', icon: Ticket },
  { key: 'staff', icon: Users },
  { key: 'sales', icon: ShoppingBag },
] as const satisfies readonly { key: string; icon: LucideIcon }[]

export const LANDING_STEP_KEYS = ['1', '2', '3'] as const

export const LANDING_AUDIENCE_KEYS = ['1', '2', '3'] as const

export const LANDING_VALUE_KEYS = ['1', '2', '3'] as const

export const LANDING_SOCIAL_KEYS = ['1', '2', '3'] as const

export const LANDING_FAQ_KEYS = ['1', '2', '3', '4'] as const
