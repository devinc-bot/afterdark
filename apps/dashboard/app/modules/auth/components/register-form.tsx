import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { registerFormFieldsSchema, registerFormSchema } from '@repo/validators'
import { Button, Field, fieldErrorMessage } from '@repo/ui'
import { DASHBOARD_ROUTES } from '../../common/constants/routes'
import { useRequestRegister } from '../mutations/use-auth-mutations'
import { AuthInput } from './auth-input'
import { AuthMethodSeparator, GoogleContinueButton } from './google-continue-button'

export function RegisterForm() {
  const { t } = useTranslation('auth')
  const register = useRequestRegister()
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { name: '', lastName: '', email: '', password: '', confirmPassword: '' },
    validators: {
      onSubmit: registerFormSchema,
    },
    onSubmit: async ({ value }) => {
      await register.mutateAsync({
        name: value.name,
        lastName: value.lastName,
        email: value.email,
        password: value.password,
      })
      setSubmittedEmail(value.email)
    },
  })

  if (submittedEmail) {
    return (
      <div className="space-y-7">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-balance text-on-surface">
            {t('register.checkEmail.title')}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
            {t('register.checkEmail.description', { email: submittedEmail })}
          </p>
        </div>
        <Button asChild size="lg" className="w-full">
          <Link to={DASHBOARD_ROUTES.login()}>{t('register.checkEmail.backToLogin')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <form
      noValidate
      className="space-y-7"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-6">
        <form.Field
          name="name"
          validators={{
            onBlur: registerFormFieldsSchema.shape.name,
            onSubmit: registerFormFieldsSchema.shape.name,
          }}
        >
          {(field) => {
            const error = fieldErrorMessage(field.state.meta.errors)
            return (
              <Field label={t('register.name')} htmlFor={field.name} error={error}>
                <AuthInput
                  id={field.name}
                  name={field.name}
                  type="text"
                  autoComplete="given-name"
                  placeholder={t('register.namePlaceholder')}
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
          name="lastName"
          validators={{
            onBlur: registerFormFieldsSchema.shape.lastName,
            onSubmit: registerFormFieldsSchema.shape.lastName,
          }}
        >
          {(field) => {
            const error = fieldErrorMessage(field.state.meta.errors)
            return (
              <Field label={t('register.lastName')} htmlFor={field.name} error={error}>
                <AuthInput
                  id={field.name}
                  name={field.name}
                  type="text"
                  autoComplete="family-name"
                  placeholder={t('register.lastNamePlaceholder')}
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
      </div>

      <form.Field
        name="email"
        validators={{
          onBlur: registerFormFieldsSchema.shape.email,
          onSubmit: registerFormFieldsSchema.shape.email,
        }}
      >
        {(field) => {
          const error = fieldErrorMessage(field.state.meta.errors)
          return (
            <Field label={t('register.email')} htmlFor={field.name} error={error}>
              <AuthInput
                id={field.name}
                name={field.name}
                type="email"
                autoComplete="email"
                placeholder={t('register.emailPlaceholder')}
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
        validators={{
          onBlur: registerFormFieldsSchema.shape.password,
          onSubmit: registerFormFieldsSchema.shape.password,
        }}
      >
        {(field) => {
          const error = fieldErrorMessage(field.state.meta.errors)
          return (
            <Field label={t('register.password')} htmlFor={field.name} error={error}>
              <AuthInput
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="new-password"
                placeholder={t('register.passwordPlaceholder')}
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
          onBlur: registerFormFieldsSchema.shape.confirmPassword,
          onSubmit: registerFormFieldsSchema.shape.confirmPassword,
        }}
      >
        {(field) => {
          const error = fieldErrorMessage(field.state.meta.errors)
          return (
            <Field label={t('register.confirmPassword')} htmlFor={field.name} error={error}>
              <AuthInput
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="new-password"
                placeholder={t('register.confirmPasswordPlaceholder')}
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

      {register.isError ? (
        <p
          role="alert"
          className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error"
        >
          {register.error.message}
        </p>
      ) : null}

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => {
          const pending = isSubmitting || register.isPending
          return (
            <Button type="submit" size="lg" className="w-full" loading={pending} disabled={pending}>
              {pending ? t('register.submitting') : t('register.submit')}
            </Button>
          )
        }}
      </form.Subscribe>

      <AuthMethodSeparator />
      <GoogleContinueButton />

      <div className="flex justify-center gap-1.5 text-sm text-on-surface-variant">
        <span>{t('register.alreadyHaveAccount')}</span>
        <Link
          to={DASHBOARD_ROUTES.login()}
          className="underline underline-offset-4 transition-colors duration-150 hover:text-primary"
        >
          {t('register.signIn')}
        </Link>
      </div>
    </form>
  )
}
