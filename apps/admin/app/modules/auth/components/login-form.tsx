import { useForm } from '@tanstack/react-form'
import { Button, Field, Input, fieldErrorMessage } from '@repo/ui'
import { loginSchema } from '@repo/validators'
import { useTranslation } from 'react-i18next'
import { useLogin } from '../mutations/use-auth-mutations'

export function LoginForm() {
  const { t } = useTranslation(['admin', 'auth'])
  const login = useLogin()

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: {
      onSubmit: loginSchema,
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
        {t('auth:login.title')}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{t('login.subtitle')}</p>

      <div className="mt-10 space-y-5">
        <form.Field
          name="email"
          validators={{ onBlur: loginSchema.shape.email, onSubmit: loginSchema.shape.email }}
        >
          {(field) => {
            const error = fieldErrorMessage(field.state.meta.errors)

            return (
              <Field label={t('auth:login.email')} htmlFor={field.name} error={error}>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth:login.emailPlaceholder')}
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
              <Field label={t('auth:login.password')} htmlFor={field.name} error={error}>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="current-password"
                  placeholder={t('auth:login.passwordPlaceholder')}
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
                {pending ? t('auth:login.submitting') : t('auth:login.submit')}
              </Button>
            )
          }}
        </form.Subscribe>
      </div>
    </form>
  )
}
