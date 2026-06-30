import { useTranslation } from 'react-i18next'
import { FormLayout } from '@afterdark/ui'
import { PageLayout } from '~/modules/common/components/page-layout'
import { useCurrentOwner } from '~/modules/common/queries/use-current-user'
import { ProfileSettingsSection } from '~/modules/owner/components/profile-settings-section'
import { SettingsFormActions } from '~/modules/owner/components/settings-form-actions'
import {
  SettingsFormSkeleton,
  SettingsLoadError,
} from '~/modules/owner/components/settings-form-states'
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

export function SettingsView() {
  const { t } = useTranslation('settings')
  const { data: owner, isLoading, error, refetch } = useCurrentOwner()

  if (isLoading) {
    return <SettingsFormSkeleton />
  }

  if (error) {
    return <SettingsLoadError message={error.message} onRetry={() => void refetch()} />
  }

  if (!owner) {
    return null
  }

  return (
    <PageLayout title={t('page.title')} description={t('page.description')} narrow>
      <SettingsFormProvider owner={owner}>
        <SettingsFormContent />
      </SettingsFormProvider>
    </PageLayout>
  )
}
