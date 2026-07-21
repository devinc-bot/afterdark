import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage, Field, Input } from '@afterdark/ui'
import { FormSection } from '~/modules/common/components/form-section'
import { useStaffSettingsForm } from '~/modules/staff/hooks/settings-form-context'

export function StaffProfileSettingsSection() {
  const { t } = useTranslation('settings')
  const { user, values, errors, setProfileField } = useStaffSettingsForm()
  const avatarSrc = user.avatar
  const avatarLabel =
    `${values.profile.name} ${values.profile.lastName}`.trim() ||
    user.email ||
    t('staff.profile.avatarFallback')

  return (
    <>
      <FormSection
        id="staff-profile"
        title={t('staff.sections.profile')}
        description={t('staff.sections.profileDescription')}
      >
        <div className="flex items-center gap-4">
          <Avatar className="size-16 shrink-0 ring-1 ring-hairline">
            <AvatarImage src={avatarSrc ?? undefined} alt={avatarLabel} className="object-cover" />
            <AvatarFallback className="bg-surface-container-low font-heading text-lg font-medium text-ink-muted">
              {avatarLabel.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
          <Field
            label={t('staff.profile.name')}
            htmlFor="settings-name"
            error={errors.profile?.name ?? null}
            className="sm:col-span-3"
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
            label={t('staff.profile.lastName')}
            htmlFor="settings-last-name"
            error={errors.profile?.lastName ?? null}
            className="sm:col-span-3"
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

          <Field
            label={t('staff.profile.phone')}
            htmlFor="settings-phone"
            error={errors.profile?.phone ?? null}
            className="sm:col-span-4"
          >
            <Input
              id="settings-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              maxLength={30}
              value={values.profile.phone}
              onChange={(event) => setProfileField('phone', event.target.value)}
              aria-invalid={errors.profile?.phone ? true : undefined}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        id="staff-account"
        title={t('staff.sections.account')}
        description={t('staff.sections.accountDescription')}
      >
        <Field label={t('staff.profile.email')} htmlFor="settings-email">
          <Input
            id="settings-email"
            name="email"
            type="email"
            autoComplete="email"
            readOnly
            value={user.email}
            aria-readonly="true"
          />
          <p className="mt-2 text-sm text-ink-muted">{t('staff.profile.emailHint')}</p>
        </Field>
      </FormSection>
    </>
  )
}
