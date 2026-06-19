import { z } from 'zod'
import { USER_ROLE } from '@afterdark/types'

export const createUserSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum([USER_ROLE.USER, USER_ROLE.OWNER, USER_ROLE.STAFF]).default(USER_ROLE.STAFF),
})

export const updateUserSchema = createUserSchema.partial().omit({ password: true })

export const updateCurrentUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ingresá al menos 2 caracteres para el nombre.')
    .max(255, 'El nombre admite hasta 255 caracteres.'),
  lastName: z
    .string()
    .trim()
    .min(2, 'Ingresá al menos 2 caracteres para el apellido.')
    .max(255, 'El apellido admite hasta 255 caracteres.'),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UpdateCurrentUserInput = z.infer<typeof updateCurrentUserSchema>
