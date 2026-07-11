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

export const forgotPasswordSchema = z.object({
  email: z.email(),
})

export const resetPasswordBaseSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
})

export const resetPasswordSchema = resetPasswordBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'validation:field.password.noMatch',
    path: ['confirmPassword'],
  }
)

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterUserInput = z.infer<typeof registerUserSchema>
export type RegisterOwnerInput = z.infer<typeof registerOwnerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
