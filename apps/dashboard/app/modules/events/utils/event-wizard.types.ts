export const EVENT_WIZARD_MODE = {
  CREATE: 'create',
  EDIT: 'edit',
} as const

export type EventWizardMode = (typeof EVENT_WIZARD_MODE)[keyof typeof EVENT_WIZARD_MODE]

export const EVENT_WIZARD_STEP = {
  LOCATION: 1,
  DETAILS: 2,
} as const

export type EventWizardStep = (typeof EVENT_WIZARD_STEP)[keyof typeof EVENT_WIZARD_STEP]

export const EVENT_LOCATION_MODE = {
  EXISTING: 'existing',
  NEW: 'new',
} as const

export type EventLocationMode = (typeof EVENT_LOCATION_MODE)[keyof typeof EVENT_LOCATION_MODE]
