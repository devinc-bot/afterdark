import { AUTH_OAUTH_APP, CLIENT_APP, USER_ROLE } from '@repo/types'
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

export const sessionClientAppSchema = z.object({
  app: z.enum([CLIENT_APP.WEB, CLIENT_APP.DASHBOARD, CLIENT_APP.ADMIN]),
})

export const googleOauthStartSchema = z
  .object({
    role: z.enum([USER_ROLE.USER, USER_ROLE.OWNER]),
    app: z.enum([AUTH_OAUTH_APP.WEB, AUTH_OAUTH_APP.DASHBOARD]),
  })
  .refine(
    (data) =>
      (data.role === USER_ROLE.USER && data.app === AUTH_OAUTH_APP.WEB) ||
      (data.role === USER_ROLE.OWNER && data.app === AUTH_OAUTH_APP.DASHBOARD),
    { message: 'Invalid role/app combination', path: ['role'] }
  )

export type GoogleOauthStartInput = z.infer<typeof googleOauthStartSchema>

/** API register body (user or owner). */
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(255),
  lastName: z.string().trim().min(2).max(255),
  email: z.email(),
  password: z.string().min(8),
})

/** Client form fields (before password-match refine). */
export const registerFormFieldsSchema = registerSchema.extend({
  confirmPassword: z.string().min(8),
})

/** Client form with confirmPassword match. */
export const registerFormSchema = registerFormFieldsSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'validation:field.password.noMatch',
    path: ['confirmPassword'],
  }
)

export const confirmUserRegistrationSchema = z.object({
  token: z.string().min(1),
})

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
export type RefreshSessionInput = z.infer<typeof sessionClientAppSchema>
export type LogoutSessionInput = RefreshSessionInput
export type RegisterInput = z.infer<typeof registerSchema>
export type RegisterUserInput = RegisterInput
export type RegisterOwnerInput = RegisterInput
export type ConfirmUserRegistrationInput = z.infer<typeof confirmUserRegistrationSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
