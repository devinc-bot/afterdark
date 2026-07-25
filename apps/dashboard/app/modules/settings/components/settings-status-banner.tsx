import { AlertCircle, Check, Loader2 } from 'lucide-react'
import { cn } from '@repo/ui'
import {
  SETTINGS_SAVE_STATUS,
  SETTINGS_STATUS_BANNER_ARIA_LIVE,
  SETTINGS_STATUS_BANNER_ROLE,
  type SettingsSaveStatus,
} from '~/modules/settings/constants/settings-form'

function getStatusBannerTone(saveStatus: SettingsSaveStatus): string {
  if (saveStatus === SETTINGS_SAVE_STATUS.SUCCESS) {
    return 'border-primary/30 bg-primary/10 text-ink'
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

function StatusIcon({ saveStatus }: { saveStatus: SettingsSaveStatus }) {
  if (saveStatus === SETTINGS_SAVE_STATUS.SUCCESS) {
    return (
      <Check
        className="mt-0.5 size-4 shrink-0 text-primary animate-in zoom-in-50 duration-(--duration-fast) motion-reduce:animate-none"
        aria-hidden="true"
        strokeWidth={2.5}
      />
    )
  }

  if (saveStatus === SETTINGS_SAVE_STATUS.ERROR) {
    return <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" aria-hidden="true" />
  }

  if (saveStatus === SETTINGS_SAVE_STATUS.SAVING) {
    return (
      <Loader2
        className="mt-0.5 size-4 shrink-0 animate-spin motion-reduce:animate-none"
        aria-hidden="true"
      />
    )
  }

  return null
}

export function SettingsStatusBanner({
  saveStatus,
  saveMessage,
}: {
  saveStatus: SettingsSaveStatus
  saveMessage: string | null
}) {
  if (!saveMessage) {
    return null
  }

  const tone = getStatusBannerTone(saveStatus)
  const { role, ariaLive } = getStatusBannerAccessibility(saveStatus)

  return (
    <div
      role={role}
      aria-live={ariaLive}
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm',
        'animate-in fade-in-0 slide-in-from-top-1 duration-(--duration-fast)',
        'motion-reduce:animate-none',
        tone
      )}
    >
      <StatusIcon saveStatus={saveStatus} />
      <p className="text-pretty">{saveMessage}</p>
    </div>
  )
}
