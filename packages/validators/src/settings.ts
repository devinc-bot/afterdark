import { z } from 'zod'
import { updateCurrentOwnerSchema } from './owner.ts'

export const SETTINGS_LANGUAGE = {
  ES: 'es',
  EN: 'en',
  DE: 'de',
} as const

export const settingsLanguageSchema = z.enum([
  SETTINGS_LANGUAGE.ES,
  SETTINGS_LANGUAGE.EN,
  SETTINGS_LANGUAGE.DE,
])

export const settingsNotificationsSchema = z.object({
  ticketSales: z.boolean(),
  inventory: z.boolean(),
  registration: z.boolean(),
  securityLog: z.boolean(),
})

export const settingsProfileSchema = updateCurrentOwnerSchema

export const settingsOrganizationSchema = z.object({
  brandName: z
    .string()
    .trim()
    .min(1, 'validation:field.organization.brandName.required')
    .max(100, 'validation:field.organization.brandName.max'),
  location: z.string().trim().max(200, 'validation:field.organization.location.max'),
})

export const settingsSecuritySchema = z.object({
  twoFactorEnabled: z.boolean(),
})

export const settingsPreferencesSchema = z.object({
  language: settingsLanguageSchema,
  notifications: settingsNotificationsSchema,
})

export const settingsFormSchema = z.object({
  profile: settingsProfileSchema,
  organization: settingsOrganizationSchema,
  security: settingsSecuritySchema,
  preferences: settingsPreferencesSchema,
})

export type SettingsFormValues = z.infer<typeof settingsFormSchema>
export type SettingsStoredValues = Pick<
  SettingsFormValues,
  'organization' | 'security' | 'preferences'
>

export const settingsStoredValuesSchema = z.object({
  organization: settingsOrganizationSchema,
  security: settingsSecuritySchema,
  preferences: settingsPreferencesSchema,
})
