export const LANDING_FEATURES = [
  { key: 'events' },
  { key: 'tickets' },
  { key: 'staff' },
  { key: 'sales' },
] as const satisfies readonly { key: 'events' | 'tickets' | 'staff' | 'sales' }[]

export const LANDING_STEP_KEYS = ['1', '2', '3'] as const

export const LANDING_AUDIENCE_KEYS = ['1', '2', '3'] as const

export const LANDING_VALUE_KEYS = ['1', '2', '3'] as const

export const LANDING_SOCIAL_KEYS = ['1', '2', '3'] as const

export const LANDING_FAQ_KEYS = ['1', '2', '3', '4'] as const
