import type esCommon from '../locales/common/es.json'
import type esAuth from '../locales/auth/es.json'
import type esValidation from '../locales/validation/es.json'
import type esErrors from '../locales/errors/es.json'
import type esEmails from '../locales/emails/es.json'
import type esDashboard from '../locales/dashboard/es.json'
import type esStaff from '../locales/staff/es.json'
import type esLocations from '../locales/locations/es.json'
import type esSettings from '../locales/settings/es.json'
import type esTickets from '../locales/tickets/es.json'
import type esEvents from '../locales/events/es.json'
import type esSales from '../locales/sales/es.json'
import type esLanding from '../locales/landing/es.json'
import type esOrders from '../locales/orders/es.json'
import type esDashboardLanding from '../locales/dashboard-landing/es.json'

export type I18nResources = {
  common: typeof esCommon
  auth: typeof esAuth
  validation: typeof esValidation
  errors: typeof esErrors
  emails: typeof esEmails
  dashboard: typeof esDashboard
  staff: typeof esStaff
  locations: typeof esLocations
  settings: typeof esSettings
  tickets: typeof esTickets
  events: typeof esEvents
  sales: typeof esSales
  landing: typeof esLanding
  orders: typeof esOrders
  dashboardLanding: typeof esDashboardLanding
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: I18nResources
  }
}
