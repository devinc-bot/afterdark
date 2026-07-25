import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from '@tanstack/react-form'
import { forgotPasswordSchema } from '@repo/validators'
import { Button, Field, fieldErrorMessage } from '@repo/ui'
import { WEB_ROUTES } from '../../common/constants/routes'
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
      <div className="w-full">
        <h1 className="font-display text-3xl font-bold tracking-tight text-balance text-on-surface md:text-4xl">
          {t('forgotPassword.title')}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
          {t('forgotPassword.success')}
        </p>
        <Button asChild size="lg" className="mt-10 w-full">
          <Link to={WEB_ROUTES.login()}>{t('forgotPassword.backToLogin')}</Link>
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
        {t('forgotPassword.title')}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
        {t('forgotPassword.description')}
      </p>

      <div className="mt-10 space-y-5">
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
                  placeholder={t('forgotPassword.emailPlaceholderWeb')}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={error ? true : undefined}
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
      </div>

      <hr className="mt-10 border-hairline" />

      <nav aria-label="Volver" className="mt-6 flex justify-center text-sm">
        <Link
          to={WEB_ROUTES.login()}
          className="text-on-surface-variant underline underline-offset-4 transition-colors duration-150 hover:text-primary"
        >
          {t('forgotPassword.backToLogin')}
        </Link>
      </nav>
    </form>
  )
}
