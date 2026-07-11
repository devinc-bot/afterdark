import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from '@tanstack/react-form'
import { forgotPasswordSchema } from '@afterdark/validators'
import { Button, Field, fieldErrorMessage } from '@afterdark/ui'
import { DASHBOARD_ROUTES } from '../../common/constants/routes'
import { useForgotPassword } from '../mutations/use-auth-mutations'
import { AuthInput } from './auth-input'

export function ForgotPasswordForm() {
  const { t } = useTranslation('auth')
  const forgotPassword = useForgotPassword()

  const form = useForm({
    defaultValues: { email: '' },
    onSubmit: async ({ value }) => {
      await forgotPassword.mutateAsync({ email: value.email })
    },
  })

  if (forgotPassword.isSuccess) {
    return (
      <section className="text-center" aria-labelledby="forgot-password-title">
        <h2
          id="forgot-password-title"
          className="font-display text-xl font-semibold text-balance text-on-surface"
        >
          {t('forgotPassword.title')}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-pretty text-on-surface-variant">
          {t('forgotPassword.success')}
        </p>
        <Button asChild size="lg" className="mt-7 w-full">
          <Link to={DASHBOARD_ROUTES.login()}>{t('forgotPassword.backToLogin')}</Link>
        </Button>
      </section>
    )
  }

  return (
    <section aria-labelledby="forgot-password-title">
      <div className="mb-7 text-center">
        <h2
          id="forgot-password-title"
          className="font-display text-xl font-semibold text-balance text-on-surface"
        >
          {t('forgotPassword.title')}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-pretty text-on-surface-variant">
          {t('forgotPassword.description')}
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
          name="email"
          validators={{
            onBlur: forgotPasswordSchema.shape.email,
            onSubmit: forgotPasswordSchema.shape.email,
          }}
        >
          {(field) => {
            const error = fieldErrorMessage(field.state.meta.errors)
            return (
              <Field label={t('forgotPassword.email')} htmlFor={field.name} error={error}>
                <AuthInput
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  placeholder={t('forgotPassword.emailPlaceholder')}
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

        {forgotPassword.isError ? (
          <p
            role="alert"
            className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error"
          >
            {forgotPassword.error.message}
          </p>
        ) : null}

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => {
            const pending = isSubmitting || forgotPassword.isPending
            return (
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={pending}
                disabled={pending}
              >
                {pending ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
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
          {t('forgotPassword.backToLogin')}
        </Link>
      </p>
    </section>
  )
}
