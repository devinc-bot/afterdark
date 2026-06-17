import { z } from 'zod'
import { USER_ROLE } from '@afterdark/types'

export const createUserSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum([USER_ROLE.USER, USER_ROLE.OWNER, USER_ROLE.STAFF]).default(USER_ROLE.STAFF),
})

export const updateUserSchema = createUserSchema.partial().omit({ password: true })

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
