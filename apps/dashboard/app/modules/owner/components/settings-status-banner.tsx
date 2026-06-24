import {
  SETTINGS_SAVE_STATUS,
  SETTINGS_STATUS_BANNER_ARIA_LIVE,
  SETTINGS_STATUS_BANNER_ROLE,
  type SettingsSaveStatus,
} from '~/modules/owner/constants/settings-form'
import { useSettingsForm } from '~/modules/owner/hooks/settings-form-context'

function getStatusBannerTone(saveStatus: SettingsSaveStatus): string {
  if (saveStatus === SETTINGS_SAVE_STATUS.SUCCESS) {
    return 'border-hairline/60 bg-surface-container-low text-ink'
  }
  if (saveStatus === SETTINGS_SAVE_STATUS.ERROR) {
    return 'border-error/30 bg-error/10 text-ink'
  }
  return 'border-hairline/60 bg-surface-container-low text-ink-muted'
}

function getStatusBannerAccessibility(saveStatus: SettingsSaveStatus) {
  if (saveStatus === SETTINGS_SAVE_STATUS.ERROR) {
    return {
      role: SETTINGS_STATUS_BANNER_ROLE.ALERT,
      ariaLive: SETTINGS_STATUS_BANNER_ARIA_LIVE.ASSERTIVE,
    }
  }

  return {
    role: SETTINGS_STATUS_BANNER_ROLE.STATUS,
    ariaLive: SETTINGS_STATUS_BANNER_ARIA_LIVE.POLITE,
  }
}

export function SettingsStatusBanner() {
  const { saveStatus, saveMessage } = useSettingsForm()

  if (!saveMessage) {
    return null
  }

  const tone = getStatusBannerTone(saveStatus)
  const { role, ariaLive } = getStatusBannerAccessibility(saveStatus)

  return (
    <div role={role} aria-live={ariaLive} className={`rounded-lg border px-4 py-3 text-sm ${tone}`}>
      {saveMessage}
    </div>
  )
}
