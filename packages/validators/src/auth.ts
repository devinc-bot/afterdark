import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Ingresá un correo electrónico válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export const registerSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.email(),
  password: z.string().min(8),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
