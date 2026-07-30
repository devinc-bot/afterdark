import { useTranslation } from 'react-i18next'
import { Checkbox, Field, Input, Label } from '@repo/ui'
import { FormSection } from '~/modules/common/components/form-section'
import { useSettingsForm } from '~/modules/owner/hooks/settings-form-context'

export function OrganizationSettingsSection() {
  const { t } = useTranslation('settings')
  const { values, errors, setProfileField } = useSettingsForm()
  const isOrganization = values.profile.isOrganization === 'true'

  const setIsOrganization = (nextChecked: boolean) => {
    setProfileField('isOrganization', nextChecked ? 'true' : 'false')
    if (!nextChecked) {
      setProfileField('organizationName', '')
      setProfileField('taxId', '')
    }
  }

  return (
    <FormSection
      id="owner-organization"
      title={t('owner.sections.organization')}
      description={t('owner.sections.organizationDescription')}
    >
      <div className="flex flex-col gap-3">
        <p id="settings-is-organization-question" className="text-sm font-medium text-ink">
          {t('owner.organization.isOrganization')}
        </p>
        <div
          role="group"
          aria-labelledby="settings-is-organization-question"
          className="flex flex-wrap items-center gap-8"
        >
          <div className="flex items-center gap-3 my-3">
            <Checkbox
              id="settings-is-organization-yes"
              checked={isOrganization}
              onCheckedChange={(checked) => {
                if (checked === true) {
                  setIsOrganization(true)
                }
              }}
              aria-invalid={errors.profile?.organizationName ? true : undefined}
            />
            <Label
              htmlFor="settings-is-organization-yes"
              className="cursor-pointer text-sm font-medium text-ink"
            >
              {t('owner.organization.yes')}
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="settings-is-organization-no"
              checked={!isOrganization}
              onCheckedChange={(checked) => {
                if (checked === true) {
                  setIsOrganization(false)
                }
              }}
            />
            <Label
              htmlFor="settings-is-organization-no"
              className="cursor-pointer text-sm font-medium text-ink"
            >
              {t('owner.organization.no')}
            </Label>
          </div>
        </div>
      </div>

      {isOrganization ? (
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
      ) : null}
    </FormSection>
  )
}
