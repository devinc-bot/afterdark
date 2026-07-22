export const EVENT_FORM_MODE = {
  CREATE: 'create',
  EDIT: 'edit',
} as const

export type EventFormMode = (typeof EVENT_FORM_MODE)[keyof typeof EVENT_FORM_MODE]
