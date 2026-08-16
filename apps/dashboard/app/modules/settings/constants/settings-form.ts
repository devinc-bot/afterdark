export const SETTINGS_SAVE_STATUS = {
  IDLE: 'idle',
  SAVING: 'saving',
  SUCCESS: 'success',
  ERROR: 'error',
} as const

export type SettingsSaveStatus = (typeof SETTINGS_SAVE_STATUS)[keyof typeof SETTINGS_SAVE_STATUS]

export const SETTINGS_FORM_ID = 'settings-form'
