import { useForm } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'
import { Lock, Mail, Zap } from 'lucide-react'
import { loginSchema } from '@afterdark/validators'
import { Button } from '@afterdark/ui'
import { DASHBOARD_ROUTES } from '../../shared/constants/routes'
import { useLogin } from '../mutations/use-auth-mutations'
import { AuthField } from './auth-field'
import { AuthInput } from './auth-input'

function fieldErrorMessage(errors: ReadonlyArray<unknown>): string | null {
  const [first] = errors
  if (!first) return null
  if (typeof first === 'string') return first
  if (typeof first === 'object' && 'message' in first) {
    return String((first as { message: unknown }).message)
  }
  return null
}

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
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field name="email" validators={{ onSubmit: loginSchema.shape.email }}>
        {(field) => {
          const error = fieldErrorMessage(field.state.meta.errors)
          return (
            <AuthField
              label="Correo"
              htmlFor={field.name}
              icon={<Mail className="size-6" />}
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
            </AuthField>
          )
        }}
      </form.Field>

      <form.Field name="password" validators={{ onSubmit: loginSchema.shape.password }}>
        {(field) => {
          const error = fieldErrorMessage(field.state.meta.errors)
          return (
            <AuthField
              label="Contraseña"
              htmlFor={field.name}
              icon={<Lock className="size-6" />}
              error={error}
              labelAction={
                <Link
                  to={DASHBOARD_ROUTES.forgotPassword()}
                  className="font-label text-[10px] font-semibold uppercase tracking-label-xs text-secondary-fixed transition-colors hover:underline"
                >
                  ¿Olvidaste?
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
            </AuthField>
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
            className="w-full"
            loading={isSubmitting}
            disabled={isSubmitting}
            iconRight={!isSubmitting ? <Zap aria-hidden="true" /> : undefined}
          >
            Acceder al sistema
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
