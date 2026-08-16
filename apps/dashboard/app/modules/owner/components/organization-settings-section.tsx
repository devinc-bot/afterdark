import { useTranslation } from 'react-i18next'
import { Field, Input } from '@repo/ui'
import { FormSection } from '~/modules/common/components/form-section'
import { useSettingsForm } from '~/modules/owner/hooks/settings-form-context'

export function OrganizationSettingsSection() {
  const { t } = useTranslation('settings')
  const { values, errors, setProfileField } = useSettingsForm()

  return (
    <FormSection
      id="owner-organization"
      title={t('owner.sections.organization')}
      description={t('owner.sections.organizationDescription')}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
        <Field
          label={t('owner.organization.name')}
          htmlFor="settings-organization-name"
          error={errors.profile?.organizationName ?? null}
          className="sm:col-span-3"
        >
          <Input
            id="settings-organization-name"
            name="organizationName"
            type="text"
            autoComplete="organization"
            maxLength={255}
            value={values.profile.organizationName}
            onChange={(event) => setProfileField('organizationName', event.target.value)}
            aria-invalid={errors.profile?.organizationName ? true : undefined}
          />
        </Field>

        <Field
          label={t('owner.organization.taxId')}
          htmlFor="settings-tax-id"
          error={errors.profile?.taxId ?? null}
          className="sm:col-span-3"
        >
          <Input
            id="settings-tax-id"
            name="taxId"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={11}
            value={values.profile.taxId}
            onChange={(event) => setProfileField('taxId', event.target.value)}
            aria-invalid={errors.profile?.taxId ? true : undefined}
          />
        </Field>
      </div>
    </FormSection>
  )
}
