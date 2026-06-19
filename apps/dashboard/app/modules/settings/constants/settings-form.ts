export const SETTINGS_STORAGE_KEY = 'afterdark:dashboard:settings:v1'

export const SETTINGS_SAVE_STATUS = {
  IDLE: 'idle',
  SAVING: 'saving',
  SUCCESS: 'success',
  ERROR: 'error',
} as const

export type SettingsSaveStatus = (typeof SETTINGS_SAVE_STATUS)[keyof typeof SETTINGS_SAVE_STATUS]

export const SETTINGS_STATUS_BANNER_ROLE = {
  ALERT: 'alert',
  STATUS: 'status',
} as const

export const SETTINGS_STATUS_BANNER_ARIA_LIVE = {
  ASSERTIVE: 'assertive',
  POLITE: 'polite',
} as const

export const SETTINGS_FORM_ID = 'settings-form'

export const SETTINGS_SUCCESS_DISMISS_MS = 4000

export const NOTIFICATION_FIELD_BY_ID = {
  'ticket-sales': 'ticketSales',
  inventory: 'inventory',
  registration: 'registration',
  'security-log': 'securityLog',
} as const

export type NotificationFieldId =
  (typeof NOTIFICATION_FIELD_BY_ID)[keyof typeof NOTIFICATION_FIELD_BY_ID]
