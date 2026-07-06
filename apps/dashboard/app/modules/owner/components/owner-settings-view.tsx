import type { CurrentOwnerResponse } from '@afterdark/types'
import { useTranslation } from 'react-i18next'
import { FormLayout } from '@afterdark/ui'
import { PageLayout } from '~/modules/common/components/page-layout'
import { ProfileSettingsSection } from '~/modules/owner/components/profile-settings-section'
import { SettingsFormActions } from '~/modules/settings/components/settings-form-actions'
import { SettingsStatusBanner } from '~/modules/settings/components/settings-status-banner'
import { SETTINGS_FORM_ID, SETTINGS_SAVE_STATUS } from '~/modules/settings/constants/settings-form'
import { SettingsFormProvider, useSettingsForm } from '~/modules/owner/hooks/settings-form-context'

function SettingsFormContent() {
  const { save, isDirty, saveStatus, saveMessage, discard } = useSettingsForm()

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
          <SettingsStatusBanner saveStatus={saveStatus} saveMessage={saveMessage} />
        </FormLayout.Span>
        <FormLayout.Span span={12}>
          <ProfileSettingsSection />
        </FormLayout.Span>
        <FormLayout.Span span={12}>
          <SettingsFormActions
            isDirty={isDirty}
            isSaving={saveStatus === SETTINGS_SAVE_STATUS.SAVING}
            onDiscard={discard}
          />
        </FormLayout.Span>
      </FormLayout>
    </form>
  )
}

export function OwnerSettingsView({ owner }: { owner: CurrentOwnerResponse }) {
  const { t } = useTranslation('settings')

  return (
    <PageLayout title={t('owner.page.title')} description={t('owner.page.description')} narrow>
      <SettingsFormProvider user={owner}>
        <SettingsFormContent />
      </SettingsFormProvider>
    </PageLayout>
  )
}
