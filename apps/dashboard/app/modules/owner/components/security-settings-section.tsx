import { useTranslation } from 'react-i18next'
import { Label, Switch } from '@afterdark/ui'
import { RECENT_SESSIONS } from '~/modules/owner/constants/settings.mock'
import { SettingsSection } from '~/modules/owner/components/settings-section'
import { useSettingsForm } from '~/modules/owner/hooks/settings-form-context'

export function SecuritySettingsSection() {
  const { t } = useTranslation('settings')
  const { values, setTwoFactorEnabled } = useSettingsForm()
  const twoFactorEnabled = values.security.twoFactorEnabled

  return (
    <SettingsSection title={t('sections.security')}>
      <div className="flex flex-col gap-6">
        <div className="flex min-h-11 items-start justify-between gap-4 py-1">
          <div className="flex min-w-0 flex-col gap-0.5 pr-4">
            <Label htmlFor="settings-two-factor" variant="field">
              {t('security.twoFactor')}
            </Label>
            <p id="settings-two-factor-description" className="text-sm text-ink-muted">
              {t('security.twoFactorDescription')}
            </p>
            <p id="settings-two-factor-hint" className="text-sm text-ink-muted">
              {t('security.twoFactorHint')}
            </p>
          </div>
          <Switch
            id="settings-two-factor"
            checked={twoFactorEnabled}
            onCheckedChange={setTwoFactorEnabled}
            aria-describedby="settings-two-factor-description settings-two-factor-hint"
            className="mt-0.5 shrink-0"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">{t('security.sessions')}</p>
          {RECENT_SESSIONS.length > 0 ? (
            <ul className="divide-y divide-hairline/60">
              {RECENT_SESSIONS.map((session) => (
                <li
                  key={session.id}
                  className="flex items-center justify-between gap-4 py-3 text-sm text-ink-muted"
                >
                  <span className="min-w-0 truncate">{session.device}</span>
                  <span className="shrink-0 font-mono text-sm tabular-nums">{session.ip}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">{t('security.sessionsEmpty')}</p>
          )}
        </div>
      </div>
    </SettingsSection>
  )
}
