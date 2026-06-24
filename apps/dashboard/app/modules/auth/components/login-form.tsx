import { useForm } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'
import { Lock, Mail } from 'lucide-react'
import { loginSchema } from '@afterdark/validators'
import { Button, Field, fieldErrorMessage } from '@afterdark/ui'
import { DASHBOARD_ROUTES } from '../../common/constants/routes'
import { useLogin } from '../mutations/use-auth-mutations'
import { AuthInput } from './auth-input'

export function LoginForm() {
  const login = useLogin()

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      await login.mutateAsync({ email: value.email, password: value.password })
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
      <form.Field
        name="email"
        validators={{ onBlur: loginSchema.shape.email, onSubmit: loginSchema.shape.email }}
      >
        {(field) => {
          const error = fieldErrorMessage(field.state.meta.errors)
          return (
            <Field
              label="Correo"
              htmlFor={field.name}
              icon={<Mail aria-hidden="true" />}
              error={error}
            >
              <AuthInput
                id={field.name}
                name={field.name}
                type="email"
                autoComplete="email"
                placeholder="admin@afterdark.io"
                hasIcon
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${field.name}-error` : undefined}
              />
            </Field>
          )
        }}
      </form.Field>

      <form.Field
        name="password"
        validators={{ onBlur: loginSchema.shape.password, onSubmit: loginSchema.shape.password }}
      >
        {(field) => {
          const error = fieldErrorMessage(field.state.meta.errors)
          return (
            <Field
              label="Contraseña"
              htmlFor={field.name}
              icon={<Lock aria-hidden="true" />}
              error={error}
              labelAction={
                <Link
                  to={DASHBOARD_ROUTES.forgotPassword()}
                  className="shrink-0 text-sm text-on-surface-variant transition-colors hover:text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              }
            >
              <AuthInput
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                hasIcon
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${field.name}-error` : undefined}
              />
            </Field>
          )
        }}
      </form.Field>

      {login.isError ? (
        <p
          role="alert"
          className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error"
        >
          {login.error.message}
        </p>
      ) : null}

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-full"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Iniciar sesión
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
