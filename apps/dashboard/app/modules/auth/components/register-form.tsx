import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Mail, Rocket, User } from 'lucide-react'
import { z } from 'zod'
import { registerSchema } from '@afterdark/validators'
import { Button } from '@afterdark/ui'
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

function fieldErrorMessage(errors: ReadonlyArray<unknown>): string | null {
  const [first] = errors
  if (!first) return null
  if (typeof first === 'string') return first
  if (typeof first === 'object' && 'message' in first) {
    return String((first as { message: unknown }).message)
  }
  return null
}

export function RegisterForm() {
  const [submitted, setSubmitted] = useState(false)

  const form = useForm({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    validators: {
      onSubmit: registerFormSchema,
    },
    onSubmit: async () => {
      setSubmitted(true)
    },
  })

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field name="name" validators={{ onSubmit: registerFormSchema.shape.name }}>
        {(field) => {
          const error = fieldErrorMessage(field.state.meta.errors)
          return (
            <AuthField label="Nombre completo" htmlFor={field.name} icon={<User />} error={error}>
              <AuthInput
                id={field.name}
                name={field.name}
                type="text"
                autoComplete="name"
                placeholder="Juan Vibe"
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

      <form.Field name="email" validators={{ onSubmit: registerFormSchema.shape.email }}>
        {(field) => {
          const error = fieldErrorMessage(field.state.meta.errors)
          return (
            <AuthField
              label="Correo corporativo"
              htmlFor={field.name}
              icon={<Mail />}
              error={error}
            >
              <AuthInput
                id={field.name}
                name={field.name}
                type="email"
                autoComplete="email"
                placeholder="venue@afterdark.io"
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

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="password" validators={{ onSubmit: registerFormSchema.shape.password }}>
          {(field) => {
            const error = fieldErrorMessage(field.state.meta.errors)
            return (
              <AuthField label="Crear contraseña" htmlFor={field.name} error={error}>
                <AuthInput
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••"
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
          validators={{ onSubmit: registerFormSchema.shape.confirmPassword }}
        >
          {(field) => {
            const error = fieldErrorMessage(field.state.meta.errors)
            return (
              <AuthField label="Confirmar" htmlFor={field.name} error={error}>
                <AuthInput
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••"
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

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <>
            {submitted ? (
              <p
                role="status"
                className="rounded-lg border border-outline-variant/40 bg-surface-container px-4 py-3 text-sm text-on-surface-variant"
              >
                El registro todavía no está disponible. Escribinos para conseguir acceso anticipado.
              </p>
            ) : null}
            <Button
              type="submit"
              size="lg"
              className="mt-4 w-full"
              loading={isSubmitting}
              disabled={isSubmitting}
              iconRight={!isSubmitting ? <Rocket aria-hidden="true" /> : undefined}
            >
              Crear cuenta
            </Button>
          </>
        )}
      </form.Subscribe>
    </form>
  )
}
