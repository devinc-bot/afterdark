import type { CurrentStaffResponse } from '@afterdark/types'
import { useTranslation } from 'react-i18next'
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
      className="flex flex-col gap-8"
      onSubmit={(event) => {
        event.preventDefault()
        void save()
      }}
    >
      <SettingsStatusBanner saveStatus={saveStatus} saveMessage={saveMessage} />
      <div className="flex flex-col gap-12">
        <StaffProfileSettingsSection />
      </div>
      <SettingsFormActions
        isDirty={isDirty}
        isSaving={saveStatus === SETTINGS_SAVE_STATUS.SAVING}
        onDiscard={discard}
      />
    </form>
  )
}

export function StaffSettingsView({ staff }: { staff: CurrentStaffResponse }) {
  const { t } = useTranslation('settings')

  return (
    <PageLayout title={t('staff.page.title')} description={t('staff.page.description')}>
      <StaffSettingsFormProvider user={staff}>
        <StaffSettingsFormContent />
      </StaffSettingsFormProvider>
    </PageLayout>
  )
}
