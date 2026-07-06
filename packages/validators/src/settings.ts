import { z } from 'zod'
import { updateCurrentOwnerSchema } from './owner.ts'

export const settingsProfileSchema = updateCurrentOwnerSchema

export const settingsFormSchema = z.object({
  profile: settingsProfileSchema,
})

export type SettingsFormValues = z.infer<typeof settingsFormSchema>
