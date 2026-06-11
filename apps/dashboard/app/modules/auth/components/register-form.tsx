import { useForm } from '@tanstack/react-form'
import { Lock, Mail, User } from 'lucide-react'
import { z } from 'zod'
import { registerSchema } from '@afterdark/validators'
import { Button } from '@afterdark/ui'
import { fieldErrorMessage } from '../utils/form-field.utils'
import { AuthField } from './auth-field'
import { AuthInput } from './auth-input'

const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(8, 'La confirmación debe tener al menos 8 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

const REGISTRATION_UNAVAILABLE_MESSAGE =
  'El registro todavía no está disponible. Contactá al administrador de tu local para solicitar acceso.'

export function RegisterForm() {
  const form = useForm({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    validators: {
      onSubmit: registerFormSchema,
    },
    onSubmit: async () => {
      // Registration is disabled until the API supports it.
    },
  })

  return (
    <div className="space-y-5">
      <p
        role="status"
        className="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant"
      >
        {REGISTRATION_UNAVAILABLE_MESSAGE}
      </p>

      <fieldset disabled className="space-y-5 opacity-60">
        <form
          noValidate
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
        >
          <form.Field
            name="name"
            validators={{
              onBlur: registerFormSchema.shape.name,
              onSubmit: registerFormSchema.shape.name,
            }}
          >
            {(field) => {
              const error = fieldErrorMessage(field.state.meta.errors)
              return (
                <AuthField
                  label="Nombre completo"
                  htmlFor={field.name}
                  icon={<User aria-hidden="true" />}
                  error={error}
                >
                  <AuthInput
                    id={field.name}
                    name={field.name}
                    type="text"
                    autoComplete="name"
                    placeholder="María González"
                    hasIcon
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${field.name}-error` : undefined}
                  />
                </AuthField>
              )
            }}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onBlur: registerFormSchema.shape.email,
              onSubmit: registerFormSchema.shape.email,
            }}
          >
            {(field) => {
              const error = fieldErrorMessage(field.state.meta.errors)
              return (
                <AuthField
                  label="Correo corporativo"
                  htmlFor={field.name}
                  icon={<Mail aria-hidden="true" />}
                  error={error}
                >
                  <AuthInput
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    placeholder="local@afterdark.io"
                    hasIcon
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${field.name}-error` : undefined}
                  />
                </AuthField>
              )
            }}
          </form.Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
            <form.Field
              name="password"
              validators={{
                onBlur: registerFormSchema.shape.password,
                onSubmit: registerFormSchema.shape.password,
              }}
            >
              {(field) => {
                const error = fieldErrorMessage(field.state.meta.errors)
                return (
                  <AuthField
                    label="Contraseña"
                    htmlFor={field.name}
                    icon={<Lock aria-hidden="true" />}
                    error={error}
                  >
                    <AuthInput
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="new-password"
                      placeholder="Mínimo 8 caracteres"
                      hasIcon
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? `${field.name}-error` : undefined}
                    />
                  </AuthField>
                )
              }}
            </form.Field>

            <form.Field
              name="confirmPassword"
              validators={{
                onBlur: registerFormSchema.shape.confirmPassword,
                onSubmit: registerFormSchema.shape.confirmPassword,
              }}
            >
              {(field) => {
                const error = fieldErrorMessage(field.state.meta.errors)
                return (
                  <AuthField
                    label="Confirmar contraseña"
                    htmlFor={field.name}
                    icon={<Lock aria-hidden="true" />}
                    error={error}
                  >
                    <AuthInput
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="new-password"
                      placeholder="Repetí la contraseña"
                      hasIcon
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? `${field.name}-error` : undefined}
                    />
                  </AuthField>
                )
              }}
            </form.Field>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled aria-disabled="true">
            Crear cuenta (próximamente)
          </Button>
        </form>
      </fieldset>
    </div>
  )
}
