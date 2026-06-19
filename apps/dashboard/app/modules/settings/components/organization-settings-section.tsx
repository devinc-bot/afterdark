import { Field, Input } from '@afterdark/ui'
import { SETTINGS_COPY } from '~/modules/settings/constants/settings.copy'
import { SettingsSection } from '~/modules/settings/components/settings-section'
import { useSettingsForm } from '~/modules/settings/hooks/settings-form-context'

export function OrganizationSettingsSection() {
  const { values, errors, setOrganizationField } = useSettingsForm()

  return (
    <SettingsSection title={SETTINGS_COPY.sections.organization}>
      <div className="flex flex-col gap-4">
        <Field
          label={SETTINGS_COPY.organization.brandName}
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
          label={SETTINGS_COPY.organization.location}
          htmlFor="settings-club-location"
          error={errors.organization?.location ?? null}
        >
          <Input
            id="settings-club-location"
            name="location"
            type="text"
            maxLength={200}
            value={values.organization.location}
            placeholder={SETTINGS_COPY.organization.locationPlaceholder}
            onChange={(event) => setOrganizationField('location', event.target.value)}
            aria-invalid={errors.organization?.location ? true : undefined}
          />
        </Field>

        <p className="text-sm text-ink-muted">{SETTINGS_COPY.organization.localHint}</p>
      </div>
    </SettingsSection>
  )
}
