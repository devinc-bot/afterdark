import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

const registerProfileSchema = z.object({
  name: z.string().min(2).max(255),
  lastName: z.string().min(2).max(255),
  email: z.email(),
  password: z.string().min(8),
})

export const registerUserSchema = registerProfileSchema
export const registerOwnerSchema = registerProfileSchema

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterUserInput = z.infer<typeof registerUserSchema>
export type RegisterOwnerInput = z.infer<typeof registerOwnerSchema>
