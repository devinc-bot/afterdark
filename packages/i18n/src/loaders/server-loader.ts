import type { I18nResources } from '../types/index.ts'

import esCommon from '../locales/common/es.json'
import enCommon from '../locales/common/en.json'
import esAuth from '../locales/auth/es.json'
import enAuth from '../locales/auth/en.json'
import esValidation from '../locales/validation/es.json'
import enValidation from '../locales/validation/en.json'
import esErrors from '../locales/errors/es.json'
import enErrors from '../locales/errors/en.json'
import esEmails from '../locales/emails/es.json'
import enEmails from '../locales/emails/en.json'
import esDashboard from '../locales/dashboard/es.json'
import enDashboard from '../locales/dashboard/en.json'
import esStaff from '../locales/staff/es.json'
import enStaff from '../locales/staff/en.json'
import esClubs from '../locales/clubs/es.json'
import enClubs from '../locales/clubs/en.json'
import esSettings from '../locales/settings/es.json'
import enSettings from '../locales/settings/en.json'
import esTickets from '../locales/tickets/es.json'
import enTickets from '../locales/tickets/en.json'

export type ServerResources = {
  es: I18nResources
  en: I18nResources
}

export const SERVER_RESOURCES: ServerResources = {
  es: {
    common: esCommon,
    auth: esAuth,
    validation: esValidation,
    errors: esErrors,
    emails: esEmails,
    dashboard: esDashboard,
    staff: esStaff,
    clubs: esClubs,
    settings: esSettings,
    tickets: esTickets,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    validation: enValidation,
    errors: enErrors,
    emails: enEmails,
    dashboard: enDashboard,
    staff: enStaff,
    clubs: enClubs,
    settings: enSettings,
    tickets: enTickets,
  },
}

export function getServerResources(language: string): I18nResources {
  return SERVER_RESOURCES[language as keyof ServerResources] ?? SERVER_RESOURCES.es
}
