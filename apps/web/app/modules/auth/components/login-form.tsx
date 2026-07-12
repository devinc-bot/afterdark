import { useMemo } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Button, Field, fieldErrorMessage } from '@afterdark/ui'
import { WEB_ROUTES } from '../../common/constants/routes'
import { useLogin } from '../mutations/use-auth-mutations'
import { googleOauthErrorMessageKey } from '../utils/google-oauth.utils'
import { AuthInput } from './auth-input'
import { AuthMethodSeparator, GoogleContinueButton } from './google-continue-button'

export function LoginForm() {
  const { t } = useTranslation('auth')
  const login = useLogin()
  const { error: oauthError } = useSearch({ from: '/login' })

  const loginFormSchema = useMemo(
    () =>
      z.object({
        email: z.email(t('field.email', { ns: 'validation' })),
        password: z.string().min(8, t('password.min', { min: 8 })),
      }),
    [t]
  )

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: {
      onSubmit: loginFormSchema,
    },
    onSubmit: async ({ value }) => {
      await login.mutateAsync(value)
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
          validators={{
            onBlur: loginFormSchema.shape.email,
            onSubmit: loginFormSchema.shape.email,
          }}
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
                />
              </Field>
            )
          }}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onBlur: loginFormSchema.shape.password,
            onSubmit: loginFormSchema.shape.password,
          }}
        >
          {(field) => {
            const error = fieldErrorMessage(field.state.meta.errors)
            return (
              <Field label={t('login.password')} htmlFor={field.name} error={error}>
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
              className="w-full"
              loading={isSubmitting || login.isPending}
              disabled={isSubmitting || login.isPending}
            >
              {isSubmitting || login.isPending ? t('login.submitting') : t('login.submit')}
            </Button>
          )}
        </form.Subscribe>

        <AuthMethodSeparator />
        <GoogleContinueButton />
      </div>

      <hr className="mt-10 border-hairline" />

      <nav aria-label="Otras opciones de acceso" className="mt-6 flex justify-center gap-3 text-sm">
        <Link
          to={WEB_ROUTES.register()}
          className="text-on-surface-variant underline underline-offset-4 transition-colors duration-150 hover:text-primary"
        >
          {t('login.createAccount')}
        </Link>
        <span aria-hidden className="text-on-surface-variant">
          ·
        </span>
        <Link
          to={WEB_ROUTES.forgotPassword()}
          className="text-on-surface-variant underline underline-offset-4 transition-colors duration-150 hover:text-primary"
        >
          {t('login.forgotPassword')}
        </Link>
      </nav>
    </form>
  )
}
