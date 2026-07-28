import { useTranslation } from 'react-i18next'
import { useForm } from '@tanstack/react-form'
import { Link, useSearch } from '@tanstack/react-router'
import { googleOauthErrorMessageKey } from '@repo/common'
import { loginSchema } from '@repo/validators'
import { Button, Field, fieldErrorMessage } from '@repo/ui'
import { DASHBOARD_ROUTES } from '../../common/constants/routes'
import { useLogin } from '../mutations/use-auth-mutations'
import { AuthInput } from './auth-input'
import { AuthMethodSeparator, GoogleContinueButton } from './google-continue-button'

export function LoginForm() {
  const { t } = useTranslation('auth')
  const login = useLogin()
  const { error: oauthError } = useSearch({ from: '/login' })

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      await login.mutateAsync({ email: value.email, password: value.password })
    },
  })

  return (
    <form
      noValidate
      className="w-full"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <h1 className="font-display text-3xl font-bold tracking-tight text-balance text-on-surface md:text-4xl">
        {t('login.title')}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{t('login.subtitle')}</p>

      <div className="mt-10 space-y-5">
        {oauthError ? (
          <p
            role="alert"
            className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error"
          >
            {t(googleOauthErrorMessageKey(oauthError))}
          </p>
        ) : null}

        <form.Field
          name="email"
          validators={{ onBlur: loginSchema.shape.email, onSubmit: loginSchema.shape.email }}
        >
          {(field) => {
            const error = fieldErrorMessage(field.state.meta.errors)
            return (
              <Field label={t('login.email')} htmlFor={field.name} error={error}>
                <AuthInput
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  placeholder={t('login.emailPlaceholder')}
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
                label={t('login.password')}
                htmlFor={field.name}
                error={error}
                labelAction={
                  <Link
                    to={DASHBOARD_ROUTES.forgotPassword()}
                    className="shrink-0 text-sm text-on-surface-variant transition-colors duration-150 hover:text-primary hover:underline"
                  >
                    {t('login.forgotPassword')}
                  </Link>
                }
              >
                <AuthInput
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="current-password"
                  placeholder={t('login.passwordPlaceholder')}
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
          {(isSubmitting) => {
            const pending = isSubmitting || login.isPending
            return (
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={pending}
                disabled={pending}
              >
                {pending ? t('login.submitting') : t('login.submit')}
              </Button>
            )
          }}
        </form.Subscribe>

        <AuthMethodSeparator />
        <GoogleContinueButton />
      </div>

      <hr className="mt-10 border-hairline" />

      <nav aria-label={t('login.noAccount')} className="mt-6 flex justify-center text-sm">
        <Link
          to={DASHBOARD_ROUTES.register()}
          className="text-on-surface-variant underline underline-offset-4 transition-colors duration-150 hover:text-primary"
        >
          {t('login.createAccount')}
        </Link>
      </nav>
    </form>
  )
}
