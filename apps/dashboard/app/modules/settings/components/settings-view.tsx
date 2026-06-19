import { FormLayout } from '@afterdark/ui'
import { useSession } from '~/modules/common/hooks/use-session'
import { ProfileSettingsSection } from '~/modules/settings/components/profile-settings-section'
import { SettingsFormActions } from '~/modules/settings/components/settings-form-actions'
import {
  SettingsFormSkeleton,
  SettingsLoadError,
} from '~/modules/settings/components/settings-form-states'
import { SettingsStatusBanner } from '~/modules/settings/components/settings-status-banner'
import { SETTINGS_COPY } from '~/modules/settings/constants/settings.copy'
import { SETTINGS_FORM_ID } from '~/modules/settings/constants/settings-form'
import {
  SettingsFormProvider,
  useSettingsForm,
} from '~/modules/settings/hooks/settings-form-context'

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
  const { user, isLoading, error, refresh } = useSession()

  if (isLoading) {
    return <SettingsFormSkeleton />
  }

  if (error) {
    return <SettingsLoadError message={error} onRetry={refresh} />
  }

  if (!user) {
    return null
  }

  return (
    <main className="bg-background px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:gap-4">
        <header className="max-w-2xl pb-2">
          <h1 className="text-balance font-heading text-2xl font-semibold text-ink sm:text-3xl">
            {SETTINGS_COPY.page.title}
          </h1>
          <p className="mt-2 text-pretty text-sm text-ink-muted sm:text-base">
            {SETTINGS_COPY.page.description}
          </p>
        </header>

        <SettingsFormProvider>
          <SettingsFormContent />
        </SettingsFormProvider>
      </div>
    </main>
  )
}
