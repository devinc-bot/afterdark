import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { resetPasswordBaseSchema } from '@repo/validators'
import { Button, Field, fieldErrorMessage } from '@repo/ui'
import { DASHBOARD_ROUTES } from '../../common/constants/routes'
import { useResetPassword } from '../mutations/use-auth-mutations'
import { AuthInput } from './auth-input'

type ResetPasswordFormProps = {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { t } = useTranslation('auth')
  const resetPassword = useResetPassword()

  const fieldsSchema = useMemo(
    () =>
      z.object({
        password: resetPasswordBaseSchema.shape.password,
        confirmPassword: z.string().min(8, t('password.min', { min: 8 })),
      }),
    [t]
  )

  const formSchema = useMemo(
    () =>
      fieldsSchema.refine((data) => data.password === data.confirmPassword, {
        message: t('password.noMatch'),
        path: ['confirmPassword'],
      }),
    [fieldsSchema, t]
  )

  const form = useForm({
    defaultValues: { password: '', confirmPassword: '' },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await resetPassword.mutateAsync({
        token,
        password: value.password,
        confirmPassword: value.confirmPassword,
      })
    },
  })

  if (!token) {
    return (
      <section className="text-center" aria-labelledby="reset-password-title">
        <h2
          id="reset-password-title"
          className="font-display text-xl font-semibold text-balance text-on-surface"
        >
          {t('resetPassword.title')}
        </h2>
        <p
          role="alert"
          className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-pretty text-error"
        >
          {t('resetPassword.invalidToken')}
        </p>
        <Button asChild size="lg" className="mt-7 w-full">
          <Link to={DASHBOARD_ROUTES.login()}>{t('resetPassword.backToLogin')}</Link>
        </Button>
      </section>
    )
  }

  if (resetPassword.isSuccess) {
    return (
      <section className="text-center" aria-labelledby="reset-password-title">
        <h2
          id="reset-password-title"
          className="font-display text-xl font-semibold text-balance text-on-surface"
        >
          {t('resetPassword.title')}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-pretty text-on-surface-variant">
          {t('resetPassword.success')}
        </p>
        <Button asChild size="lg" className="mt-7 w-full">
          <Link to={DASHBOARD_ROUTES.login()}>{t('resetPassword.backToLogin')}</Link>
        </Button>
      </section>
    )
  }

  return (
    <section aria-labelledby="reset-password-title">
      <div className="mb-7 text-center">
        <h2
          id="reset-password-title"
          className="font-display text-xl font-semibold text-balance text-on-surface"
        >
          {t('resetPassword.title')}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-pretty text-on-surface-variant">
          {t('resetPassword.description')}
        </p>
      </div>

      <form
        noValidate
        className="space-y-7"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="password"
          validators={{
            onBlur: fieldsSchema.shape.password,
            onSubmit: fieldsSchema.shape.password,
          }}
        >
          {(field) => {
            const error = fieldErrorMessage(field.state.meta.errors)
            return (
              <Field label={t('resetPassword.password')} htmlFor={field.name} error={error}>
                <AuthInput
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="new-password"
                  placeholder={t('resetPassword.passwordPlaceholder')}
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
          name="confirmPassword"
          validators={{
            onBlur: fieldsSchema.shape.confirmPassword,
            onSubmit: fieldsSchema.shape.confirmPassword,
          }}
        >
          {(field) => {
            const error = fieldErrorMessage(field.state.meta.errors)
            return (
              <Field label={t('resetPassword.confirmPassword')} htmlFor={field.name} error={error}>
                <AuthInput
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="new-password"
                  placeholder={t('resetPassword.confirmPasswordPlaceholder')}
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

        {resetPassword.isError ? (
          <p
            role="alert"
            className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error"
          >
            {resetPassword.error.message}
          </p>
        ) : null}

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => {
            const pending = isSubmitting || resetPassword.isPending
            return (
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={pending}
                disabled={pending}
              >
                {pending ? t('resetPassword.submitting') : t('resetPassword.submit')}
              </Button>
            )
          }}
        </form.Subscribe>
      </form>

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        <Link
          to={DASHBOARD_ROUTES.login()}
          className="text-primary transition-colors duration-150 hover:underline"
        >
          {t('resetPassword.backToLogin')}
        </Link>
      </p>
    </section>
  )
}
