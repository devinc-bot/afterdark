import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { resetPasswordBaseSchema } from '@repo/validators'
import { Button, Field, fieldErrorMessage } from '@repo/ui'
import { WEB_ROUTES } from '../../common/constants/routes'
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
      <div className="w-full">
        <h1 className="font-display text-3xl font-bold tracking-tight text-balance text-on-surface md:text-4xl">
          {t('resetPassword.title')}
        </h1>
        <p role="alert" className="mt-3 text-sm leading-relaxed text-error">
          {t('resetPassword.invalidToken')}
        </p>
        <Button asChild size="lg" className="mt-10 w-full">
          <Link to={WEB_ROUTES.login()}>{t('resetPassword.backToLogin')}</Link>
        </Button>
      </div>
    )
  }

  if (resetPassword.isSuccess) {
    return (
      <div className="w-full">
        <h1 className="font-display text-3xl font-bold tracking-tight text-balance text-on-surface md:text-4xl">
          {t('resetPassword.title')}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
          {t('resetPassword.success')}
        </p>
        <Button asChild size="lg" className="mt-10 w-full">
          <Link to={WEB_ROUTES.login()}>{t('resetPassword.backToLogin')}</Link>
        </Button>
      </div>
    )
  }

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
        {t('resetPassword.title')}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
        {t('resetPassword.description')}
      </p>

      <div className="mt-10 space-y-5">
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
      </div>

      <hr className="mt-10 border-hairline" />

      <nav aria-label="Volver" className="mt-6 flex justify-center text-sm">
        <Link
          to={WEB_ROUTES.login()}
          className="text-on-surface-variant underline underline-offset-4 transition-colors duration-150 hover:text-primary"
        >
          {t('resetPassword.backToLogin')}
        </Link>
      </nav>
    </form>
  )
}
