import { useTranslation } from 'react-i18next'
import { Field, Input } from '@afterdark/ui'
import { SettingsSection } from '~/modules/owner/components/settings-section'
import { useSettingsForm } from '~/modules/owner/hooks/settings-form-context'

export function OrganizationSettingsSection() {
  const { t } = useTranslation('settings')
  const { values, errors, setOrganizationField } = useSettingsForm()

  return (
    <SettingsSection title={t('sections.organization')}>
      <div className="flex flex-col gap-4">
        <Field
          label={t('organization.brandName')}
          htmlFor="settings-brand-name"
          error={errors.organization?.brandName ?? null}
        >
          <Input
            id="settings-brand-name"
            name="brandName"
            type="text"
            maxLength={100}
            value={values.organization.brandName}
            onChange={(event) => setOrganizationField('brandName', event.target.value)}
            aria-invalid={errors.organization?.brandName ? true : undefined}
          />
        </Field>

        <Field
          label={t('organization.location')}
          htmlFor="settings-club-location"
          error={errors.organization?.location ?? null}
        >
          <Input
            id="settings-club-location"
            name="location"
            type="text"
            maxLength={200}
            value={values.organization.location}
            placeholder={t('organization.locationPlaceholder')}
            onChange={(event) => setOrganizationField('location', event.target.value)}
            aria-invalid={errors.organization?.location ? true : undefined}
          />
        </Field>

        <p className="text-sm text-ink-muted">{t('organization.localHint')}</p>
      </div>
    </SettingsSection>
  )
}
