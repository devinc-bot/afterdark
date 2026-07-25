import { useForm } from '@tanstack/react-form'
import { Trans, useTranslation } from 'react-i18next'
import { AlertCircle, Check } from 'lucide-react'
import type { CurrentUserResponse } from '@repo/types'
import {
  updateCurrentUserProfileSchema,
  type UpdateCurrentUserProfileInput,
} from '@repo/validators'
import { useResolveFieldError } from '@repo/i18n/client'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Field,
  Input,
  Label,
  cn,
  useUnsavedChangesGuard,
} from '@repo/ui'
import { getUserInitials } from '~/modules/common/utils/user-initials.utils'
import { useUpdateProfile } from '~/modules/settings/queries/use-update-profile'

type ProfileFormProps = {
  profile: CurrentUserResponse
}

function normalizeProfileValues(
  values: UpdateCurrentUserProfileInput
): UpdateCurrentUserProfileInput {
  return {
    name: values.name.trim(),
    lastName: values.lastName.trim(),
    phone: values.phone.trim(),
  }
}

function isProfileDirty(
  values: UpdateCurrentUserProfileInput,
  profile: CurrentUserResponse
): boolean {
  const next = normalizeProfileValues(values)
  return (
    next.name !== profile.name.trim() ||
    next.lastName !== profile.lastName.trim() ||
    next.phone !== profile.phone.trim()
  )
}

function ProfileUnsavedGuard({ isDirty, message }: { isDirty: boolean; message: string }) {
  useUnsavedChangesGuard(isDirty, message)
  return null
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { t } = useTranslation('settings')
  const resolveFieldError = useResolveFieldError()
  const updateProfile = useUpdateProfile()

  const form = useForm({
    defaultValues: {
      name: profile.name,
      lastName: profile.lastName,
      phone: profile.phone,
    } satisfies UpdateCurrentUserProfileInput,
    validators: {
      onSubmit: updateCurrentUserProfileSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const normalized = normalizeProfileValues(value)
        await updateProfile.mutateAsync(normalized)
        form.reset(normalized)
      } catch {
        // Feedback via updateProfile.isError / error.message
      }
    },
  })

  const initials = getUserInitials(profile.name, profile.lastName)
  const displayName = `${profile.name} ${profile.lastName}`.trim()
  const avatarLabel = displayName || profile.email || t('web.profile.avatarFallback')
  const isPending = updateProfile.isPending
  const emailHintId = 'profile-email-hint'
  const supportEmail = t('web.form.supportEmail')

  const clearMutationFeedback = () => {
    if (updateProfile.isSuccess || updateProfile.isError) {
      updateProfile.reset()
    }
  }

  const handleDiscard = () => {
    form.reset({
      name: profile.name,
      lastName: profile.lastName,
      phone: profile.phone,
    })
    clearMutationFeedback()
  }

  return (
    <div className="space-y-8">
      <form.Subscribe selector={(state) => isProfileDirty(state.values, profile)}>
        {(dirty) => (
          <ProfileUnsavedGuard isDirty={dirty} message={t('shared.actions.confirmLeave')} />
        )}
      </form.Subscribe>

      <div className="flex items-center gap-4 border-b border-outline-variant/35 pb-8 sm:gap-5">
        <Avatar className="size-16 shrink-0 ring-1 ring-outline-variant/50 sm:size-20">
          {profile.avatar ? (
            <AvatarImage src={profile.avatar} alt={avatarLabel} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-surface-container font-display text-lg font-semibold text-on-surface sm:text-xl">
            {initials || avatarLabel.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold tracking-[-0.01em] text-on-surface sm:text-xl">
            {displayName || avatarLabel}
          </p>
          <p className="mt-0.5 truncate font-label text-sm text-on-surface-variant">
            {profile.email}
          </p>
        </div>
      </div>

      <form
        noValidate
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          updateProfile.reset()
          void form.handleSubmit()
        }}
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <form.Field
            name="name"
            validators={{
              onBlur: updateCurrentUserProfileSchema.shape.name,
              onSubmit: updateCurrentUserProfileSchema.shape.name,
            }}
          >
            {(field) => {
              const error = resolveFieldError(field.state.meta.errors)

              return (
                <Field label={t('web.form.name')} htmlFor={field.name} error={error}>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    autoComplete="given-name"
                    maxLength={255}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      clearMutationFeedback()
                      field.handleChange(event.target.value)
                    }}
                    aria-invalid={error ? true : undefined}
                    disabled={isPending}
                  />
                </Field>
              )
            }}
          </form.Field>

          <form.Field
            name="lastName"
            validators={{
              onBlur: updateCurrentUserProfileSchema.shape.lastName,
              onSubmit: updateCurrentUserProfileSchema.shape.lastName,
            }}
          >
            {(field) => {
              const error = resolveFieldError(field.state.meta.errors)

              return (
                <Field label={t('web.form.lastName')} htmlFor={field.name} error={error}>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    autoComplete="family-name"
                    maxLength={255}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      clearMutationFeedback()
                      field.handleChange(event.target.value)
                    }}
                    aria-invalid={error ? true : undefined}
                    disabled={isPending}
                  />
                </Field>
              )
            }}
          </form.Field>
        </div>

        <form.Field
          name="phone"
          validators={{
            onBlur: updateCurrentUserProfileSchema.shape.phone,
            onSubmit: updateCurrentUserProfileSchema.shape.phone,
          }}
        >
          {(field) => {
            const error = resolveFieldError(field.state.meta.errors)

            return (
              <Field label={t('web.form.phone')} htmlFor={field.name} error={error}>
                <Input
                  id={field.name}
                  name={field.name}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={30}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    clearMutationFeedback()
                    field.handleChange(event.target.value)
                  }}
                  aria-invalid={error ? true : undefined}
                  disabled={isPending}
                />
              </Field>
            )
          }}
        </form.Field>

        <div className="space-y-1.5">
          <Label htmlFor="profile-email" variant="field">
            {t('web.form.email')}
          </Label>
          <p id="profile-email" className="font-body text-sm leading-6 text-on-surface select-all">
            {profile.email}
          </p>
          <p
            id={emailHintId}
            className="font-label text-xs leading-relaxed text-on-surface-variant"
          >
            <Trans
              i18nKey="web.form.emailHint"
              ns="settings"
              values={{ supportEmail }}
              components={{
                supportLink: (
                  <a
                    href={`mailto:${supportEmail}?subject=${encodeURIComponent(t('web.form.emailSupportSubject'))}`}
                    className="font-medium text-on-surface underline decoration-outline-variant underline-offset-2 transition-colors hover:decoration-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                  />
                ),
              }}
            />
          </p>
        </div>

        {updateProfile.isSuccess ? (
          <div
            role="status"
            aria-live="polite"
            className={cn(
              'flex items-start gap-3 border border-primary/25 bg-primary/8 px-4 py-3 text-sm text-on-surface',
              'animate-in fade-in-0 slide-in-from-top-1 duration-(--duration-fast)',
              'ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:animate-none'
            )}
          >
            <Check
              className="mt-0.5 size-4 shrink-0 text-primary animate-in zoom-in-50 duration-(--duration-fast) motion-reduce:animate-none"
              aria-hidden="true"
              strokeWidth={2.5}
            />
            <p className="text-pretty">{t('web.messages.saveSuccess')}</p>
          </div>
        ) : null}

        {updateProfile.isError ? (
          <div
            role="alert"
            aria-live="assertive"
            className={cn(
              'flex items-start gap-3 border border-error/40 bg-error-container/15 px-4 py-3 text-sm text-error',
              'animate-in fade-in-0 slide-in-from-top-1 duration-(--duration-fast)',
              'ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:animate-none'
            )}
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p className="text-pretty">
              {updateProfile.error.message || t('web.messages.saveError')}
            </p>
          </div>
        ) : null}

        <form.Subscribe selector={(state) => [state.values, state.isSubmitting] as const}>
          {([values, isSubmitting]) => {
            const busy = isSubmitting || isPending
            const dirty = isProfileDirty(values, profile)
            const canSave = dirty && !busy

            return (
              <div
                className={cn(
                  'sticky bottom-0 z-10 -mx-1 mt-1 border-t border-outline-variant/35 bg-background/80 px-1 pt-5 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-(--shadow-glass) backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/65',
                  'motion-reduce:backdrop-blur-none motion-reduce:bg-background motion-reduce:shadow-none'
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <p className="font-label text-xs text-on-surface-variant" aria-live="polite">
                    {dirty ? t('web.actions.dirty') : t('web.actions.clean')}
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <Button
                      type="button"
                      size="lg"
                      variant="ghost"
                      className="w-full sm:w-auto"
                      disabled={!dirty || busy}
                      onClick={handleDiscard}
                    >
                      {t('shared.actions.discard')}
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      variant={dirty ? 'default' : 'outline'}
                      className="w-full sm:w-auto"
                      loading={busy}
                      disabled={!canSave}
                    >
                      {busy ? t('web.actions.saving') : t('web.actions.save')}
                    </Button>
                  </div>
                </div>
              </div>
            )
          }}
        </form.Subscribe>
      </form>
    </div>
  )
}
