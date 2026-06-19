import { Button, Field, Input, Label } from '@afterdark/ui'
import { SETTINGS_COPY } from '~/modules/settings/constants/settings.copy'
import { SettingsSection } from '~/modules/settings/components/settings-section'
import { useSettingsForm } from '~/modules/settings/hooks/settings-form-context'

export function ProfileSettingsSection() {
  const { user, values, errors, setProfileField } = useSettingsForm()
  const avatarSrc = user.avatar
  const avatarLabel =
    `${values.profile.name} ${values.profile.lastName}`.trim() ||
    user.email ||
    SETTINGS_COPY.profile.avatarFallback

  return (
    <SettingsSection title={SETTINGS_COPY.sections.profile}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr] sm:gap-8">
        <div className="flex flex-col items-start gap-3">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={avatarLabel}
              className="size-16 rounded-full object-cover ring-1 ring-hairline"
            />
          ) : (
            <div
              role="img"
              aria-label={avatarLabel}
              className="flex size-16 items-center justify-center rounded-full bg-surface-container-low font-heading text-lg font-medium text-ink-muted ring-1 ring-hairline"
            >
              {avatarLabel.charAt(0).toUpperCase()}
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 min-h-11 px-2 text-ink-muted"
            disabled
            aria-describedby="settings-avatar-hint"
          >
            {SETTINGS_COPY.profile.changePhoto}
          </Button>
          <p id="settings-avatar-hint" className="max-w-44 text-sm text-ink-muted">
            {SETTINGS_COPY.profile.photoHint}
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label={SETTINGS_COPY.profile.name}
              htmlFor="settings-name"
              error={errors.profile?.name ?? null}
            >
              <Input
                id="settings-name"
                name="name"
                type="text"
                autoComplete="given-name"
                maxLength={255}
                value={values.profile.name}
                onChange={(event) => setProfileField('name', event.target.value)}
                aria-invalid={errors.profile?.name ? true : undefined}
              />
            </Field>

            <Field
              label={SETTINGS_COPY.profile.lastName}
              htmlFor="settings-last-name"
              error={errors.profile?.lastName ?? null}
            >
              <Input
                id="settings-last-name"
                name="lastName"
                type="text"
                autoComplete="family-name"
                maxLength={255}
                value={values.profile.lastName}
                onChange={(event) => setProfileField('lastName', event.target.value)}
                aria-invalid={errors.profile?.lastName ? true : undefined}
              />
            </Field>
          </div>

          <Field label={SETTINGS_COPY.profile.email} htmlFor="settings-email">
            <Input
              id="settings-email"
              name="email"
              type="email"
              autoComplete="email"
              readOnly
              value={user.email}
              aria-readonly="true"
            />
          </Field>
          <p className="-mt-2 text-sm text-ink-muted">{SETTINGS_COPY.profile.emailHint}</p>

          <div className="flex flex-col gap-2">
            <Label variant="field">{SETTINGS_COPY.profile.password}</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 min-h-11 w-fit px-2 text-ink-muted"
              disabled
              aria-describedby="settings-password-hint"
            >
              {SETTINGS_COPY.profile.changePassword}
            </Button>
            <p id="settings-password-hint" className="text-sm text-ink-muted">
              {SETTINGS_COPY.profile.passwordHint}
            </p>
          </div>
        </div>
      </div>
    </SettingsSection>
  )
}
