import { USER_ROLE } from '@repo/types'
import {
  SettingsFormSkeleton,
  SettingsLoadError,
} from '~/modules/settings/components/settings-load-states'
import { OwnerSettingsView } from '~/modules/owner/components/owner-settings-view'
import { useSettings } from '~/modules/settings/queries/use-settings'
import { StaffSettingsView } from '~/modules/staff/components/staff-settings-view'
import { AccountSessionsSection } from './account-sessions-section'

export function SettingsView() {
  const { data, isLoading, error, refetch } = useSettings()

  if (isLoading) {
    return <SettingsFormSkeleton />
  }

  if (error) {
    return <SettingsLoadError message={error.message} onRetry={() => void refetch()} />
  }

  if (!data) {
    return null
  }

  if (data.role === USER_ROLE.OWNER) {
    return (
      <>
        <OwnerSettingsView owner={data} />
        <AccountSessionsSection />
      </>
    )
  }

  if (data.role === USER_ROLE.STAFF) {
    return (
      <>
        <StaffSettingsView staff={data} />
        <AccountSessionsSection />
      </>
    )
  }

  return null
}
