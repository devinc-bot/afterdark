import { useMemo } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Button, Field, fieldErrorMessage } from '@afterdark/ui'
import { WEB_ROUTES } from '../../common/constants/routes'
import { useRegister } from '../mutations/use-auth-mutations'
import { AuthInput } from './auth-input'

export function RegisterForm() {
  const { t } = useTranslation('auth')
  const register = useRegister()

  const registerFormSchema = useMemo(
    () =>
      z
        .object({
          name: z.string().trim().min(2, t('profile.name.min')).max(255, t('profile.name.max')),
          lastName: z
            .string()
            .trim()
            .min(2, t('profile.lastName.min'))
            .max(255, t('profile.lastName.max')),
          email: z.email(t('field.email', { ns: 'validation' })),
          password: z.string().min(8, t('password.min', { min: 8 })),
          confirmPassword: z.string().min(8, t('password.min', { min: 8 })),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t('password.noMatch'),
          path: ['confirmPassword'],
        }),
    [t]
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

  const isBusy = register.isPending

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
        {t('register.title')}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
        {t('register.subtitle')}
      </p>

      <div className="mt-10 space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
          <form.Field
            name="name"
            validators={{
              onBlur: registerFormSchema.shape.name,
              onSubmit: registerFormSchema.shape.name,
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
                  />
                </Field>
              )
            }}
          </form.Field>

          <form.Field
            name="lastName"
            validators={{
              onBlur: registerFormSchema.shape.lastName,
              onSubmit: registerFormSchema.shape.lastName,
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
                  />
                </Field>
              )
            }}
          </form.Field>
        </div>

        <form.Field
          name="email"
          validators={{
            onBlur: registerFormSchema.shape.email,
            onSubmit: registerFormSchema.shape.email,
          }}
        >
          {(field) => {
            const error = fieldErrorMessage(field.state.meta.errors)
            return (
              <Field label={t('register.emailWeb')} htmlFor={field.name} error={error}>
                <AuthInput
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  placeholder={t('register.emailPlaceholderWeb')}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={error ? true : undefined}
                />
              </Field>
            )
          }}
        </form.Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
          <form.Field
            name="password"
            validators={{
              onBlur: registerFormSchema.shape.password,
              onSubmit: registerFormSchema.shape.password,
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
                  />
                </Field>
              )
            }}
          </form.Field>

          <form.Field
            name="confirmPassword"
            validators={{
              onBlur: registerFormSchema.shape.confirmPassword,
              onSubmit: registerFormSchema.shape.confirmPassword,
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
                  />
                </Field>
              )
            }}
          </form.Field>
        </div>

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
            const loading = isSubmitting || isBusy
            return (
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                {loading ? t('register.submitting') : t('register.submit')}
              </Button>
            )
          }}
        </form.Subscribe>
      </div>

      <hr className="mt-10 border-hairline" />

      <nav aria-label="Otras opciones de acceso" className="mt-6 flex justify-center text-sm">
        <Link
          to={WEB_ROUTES.login()}
          className="text-on-surface-variant underline underline-offset-4 transition-colors duration-150 hover:text-primary"
        >
          {t('register.alreadyHaveAccount')} {t('register.signIn')}
        </Link>
      </nav>
    </form>
  )
}
