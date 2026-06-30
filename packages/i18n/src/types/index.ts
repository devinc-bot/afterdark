import type esCommon from '../locales/common/es.json'
import type esAuth from '../locales/auth/es.json'
import type esValidation from '../locales/validation/es.json'
import type esErrors from '../locales/errors/es.json'
import type esEmails from '../locales/emails/es.json'
import type esDashboard from '../locales/dashboard/es.json'
import type esStaff from '../locales/staff/es.json'
import type esClubs from '../locales/clubs/es.json'
import type esSettings from '../locales/settings/es.json'
import type esTickets from '../locales/tickets/es.json'

export type I18nResources = {
  common: typeof esCommon
  auth: typeof esAuth
  validation: typeof esValidation
  errors: typeof esErrors
  emails: typeof esEmails
  dashboard: typeof esDashboard
  staff: typeof esStaff
  clubs: typeof esClubs
  settings: typeof esSettings
  tickets: typeof esTickets
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: I18nResources
  }
}
