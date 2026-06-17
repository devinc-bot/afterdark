import { useForm } from '@tanstack/react-form'
import { Lock, Mail, User } from 'lucide-react'
import { z } from 'zod'
import { registerSchema } from '@afterdark/validators'
import { Button } from '@afterdark/ui'
import { useRegister } from '../mutations/use-auth-mutations'
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

export function RegisterForm() {
  const register = useRegister()

  const form = useForm({
    defaultValues: { name: '', lastName: '', email: '', password: '', confirmPassword: '' },
    validators: {
      onSubmit: registerFormSchema,
    },
    onSubmit: async ({ value }) => {
      await register.mutateAsync({
        name: value.name,
        lastName: value.lastName,
        email: value.email,
        password: value.password,
      })
    },
  })

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
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
                label="Nombre"
                htmlFor={field.name}
                icon={<User aria-hidden="true" />}
                error={error}
              >
                <AuthInput
                  id={field.name}
                  name={field.name}
                  type="text"
                  autoComplete="given-name"
                  placeholder="María"
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
          name="lastName"
          validators={{
            onBlur: registerFormSchema.shape.lastName,
            onSubmit: registerFormSchema.shape.lastName,
          }}
        >
          {(field) => {
            const error = fieldErrorMessage(field.state.meta.errors)
            return (
              <AuthField
                label="Apellido"
                htmlFor={field.name}
                icon={<User aria-hidden="true" />}
                error={error}
              >
                <AuthInput
                  id={field.name}
                  name={field.name}
                  type="text"
                  autoComplete="family-name"
                  placeholder="González"
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

      {register.isError ? (
        <p
          role="alert"
          className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error"
        >
          {register.error.message}
        </p>
      ) : null}

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Crear cuenta
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
