import { useForm } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'
import { loginSchema } from '@afterdark/validators'
import { fieldErrorMessage } from '@afterdark/ui'
import { WEB_ROUTES } from '../../common/constants/routes'
import { useLogin } from '../mutations/use-auth-mutations'

export function LoginForm() {
  const login = useLogin()

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      await login.mutateAsync(value)
    },
  })

  return (
    <form
      noValidate
      className="w-full max-w-sm"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <h1 className="text-3xl font-bold tracking-tight text-balance">Iniciar sesión</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Accedé a tu cuenta para gestionar tus entradas.
      </p>

      <div className="mt-10 flex flex-col gap-6">
        <form.Field name="email" validators={{ onSubmit: loginSchema.shape.email }}>
          {(field) => {
            const error = fieldErrorMessage(field.state.meta.errors)
            return (
              <div className="flex flex-col gap-2">
                <label htmlFor={field.name} className="text-sm text-muted-foreground">
                  Correo electrónico
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@ejemplo.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${field.name}-error` : undefined}
                  className="w-full rounded-md border border-input bg-card px-3.5 py-2.5 text-sm text-foreground transition-colors duration-150 focus:border-ring aria-invalid:border-destructive"
                />
                {error ? (
                  <p id={`${field.name}-error`} className="text-sm text-destructive">
                    {error}
                  </p>
                ) : null}
              </div>
            )
          }}
        </form.Field>

        <form.Field name="password" validators={{ onSubmit: loginSchema.shape.password }}>
          {(field) => {
            const error = fieldErrorMessage(field.state.meta.errors)
            return (
              <div className="flex flex-col gap-2">
                <label htmlFor={field.name} className="text-sm text-muted-foreground">
                  Contraseña
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${field.name}-error` : undefined}
                  className="w-full rounded-md border border-input bg-card px-3.5 py-2.5 text-sm text-foreground transition-colors duration-150 focus:border-ring aria-invalid:border-destructive"
                />
                {error ? (
                  <p id={`${field.name}-error`} className="text-sm text-destructive">
                    {error}
                  </p>
                ) : null}
              </div>
            )
          }}
        </form.Field>

        {login.isError ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
          >
            {login.error.message}
          </p>
        ) : null}

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover active:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Ingresando…' : 'Ingresar'}
            </button>
          )}
        </form.Subscribe>
      </div>

      <hr className="mt-10 border-border" />

      <nav aria-label="Otras opciones de acceso" className="mt-6 flex justify-center gap-3 text-sm">
        <Link
          to={WEB_ROUTES.register()}
          className="text-muted-foreground underline underline-offset-4 transition-colors duration-150 hover:text-accent"
        >
          Crear cuenta
        </Link>
        <span aria-hidden className="text-muted-foreground">
          ·
        </span>
        <Link
          to={WEB_ROUTES.forgotPassword()}
          className="text-muted-foreground underline underline-offset-4 transition-colors duration-150 hover:text-accent"
        >
          Olvidé mi contraseña
        </Link>
      </nav>
    </form>
  )
}
