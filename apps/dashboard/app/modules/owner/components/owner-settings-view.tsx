import type { CurrentOwnerResponse } from '@afterdark/types'
import { useTranslation } from 'react-i18next'
import { FormLayout } from '@afterdark/ui'
import { PageLayout } from '~/modules/common/components/page-layout'
import { ProfileSettingsSection } from '~/modules/owner/components/profile-settings-section'
import { SettingsFormActions } from '~/modules/owner/components/settings-form-actions'
import { SettingsStatusBanner } from '~/modules/owner/components/settings-status-banner'
import { SETTINGS_FORM_ID } from '~/modules/owner/constants/settings-form'
import { SettingsFormProvider, useSettingsForm } from '~/modules/owner/hooks/settings-form-context'

function SettingsFormContent() {
  const { save } = useSettingsForm()

  return (
    <form
      id={SETTINGS_FORM_ID}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void save()
      }}
    >
      <FormLayout className="gap-2 sm:gap-4">
        <FormLayout.Span span={12}>
          <SettingsStatusBanner />
        </FormLayout.Span>
        <FormLayout.Span span={12}>
          <ProfileSettingsSection />
        </FormLayout.Span>
        <FormLayout.Span span={12}>
          <SettingsFormActions />
        </FormLayout.Span>
      </FormLayout>
    </form>
  )
}

export function OwnerSettingsView({ owner }: { owner: CurrentOwnerResponse }) {
  const { t } = useTranslation('settings')

  return (
    <PageLayout title={t('owner.page.title')} description={t('owner.page.description')} narrow>
      <SettingsFormProvider owner={owner}>
        <SettingsFormContent />
      </SettingsFormProvider>
    </PageLayout>
  )
}
