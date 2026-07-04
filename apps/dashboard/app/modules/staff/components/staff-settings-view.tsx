import type { CurrentStaffResponse } from '@afterdark/types'
import { useTranslation } from 'react-i18next'
import { FormLayout } from '@afterdark/ui'
import { PageLayout } from '~/modules/common/components/page-layout'
import { StaffProfileSettingsSection } from '~/modules/staff/components/staff-profile-settings-section'
import { SettingsFormActions } from '~/modules/settings/components/settings-form-actions'
import { SettingsStatusBanner } from '~/modules/settings/components/settings-status-banner'
import { SETTINGS_FORM_ID, SETTINGS_SAVE_STATUS } from '~/modules/settings/constants/settings-form'
import {
  StaffSettingsFormProvider,
  useStaffSettingsForm,
} from '~/modules/staff/hooks/settings-form-context'

function StaffSettingsFormContent() {
  const { save, isDirty, saveStatus, saveMessage, discard } = useStaffSettingsForm()

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
          <StaffProfileSettingsSection />
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

export function StaffSettingsView({ staff }: { staff: CurrentStaffResponse }) {
  const { t } = useTranslation('settings')

  return (
    <PageLayout title={t('staff.page.title')} description={t('staff.page.description')} narrow>
      <StaffSettingsFormProvider user={staff}>
        <StaffSettingsFormContent />
      </StaffSettingsFormProvider>
    </PageLayout>
  )
}
