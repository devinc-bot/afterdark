import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { registerOwnerSchema } from '@repo/validators'
import { Button, Field, fieldErrorMessage } from '@repo/ui'
import { useRegister } from '../mutations/use-auth-mutations'
import { AuthInput } from './auth-input'
import { AuthMethodSeparator, GoogleContinueButton } from './google-continue-button'

export function RegisterForm() {
  const { t } = useTranslation('auth')
  const register = useRegister()

  const registerFieldsSchema = useMemo(
    () =>
      registerOwnerSchema.extend({
        confirmPassword: z.string().min(8, t('password.min', { min: 8 })),
      }),
    [t]
  )

  const registerFormSchema = useMemo(
    () =>
      registerFieldsSchema.refine((data) => data.password === data.confirmPassword, {
        message: t('password.noMatch'),
        path: ['confirmPassword'],
      }),
    [registerFieldsSchema, t]
  )

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
    },
  })

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
            onBlur: registerFieldsSchema.shape.name,
            onSubmit: registerFieldsSchema.shape.name,
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
            onBlur: registerFieldsSchema.shape.lastName,
            onSubmit: registerFieldsSchema.shape.lastName,
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
          onBlur: registerFieldsSchema.shape.email,
          onSubmit: registerFieldsSchema.shape.email,
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
          onBlur: registerFieldsSchema.shape.password,
          onSubmit: registerFieldsSchema.shape.password,
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
          onBlur: registerFieldsSchema.shape.confirmPassword,
          onSubmit: registerFieldsSchema.shape.confirmPassword,
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
    </form>
  )
}
