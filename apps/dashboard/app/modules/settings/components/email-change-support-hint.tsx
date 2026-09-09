import { Trans, useTranslation } from 'react-i18next'
import { clientEnv } from '~/config/env'

type EmailChangeSupportHintProps = {
  hintKey: 'owner.profile.emailHint' | 'staff.profile.emailHint'
  subjectKey: 'owner.profile.emailSupportSubject' | 'staff.profile.emailSupportSubject'
}

export function EmailChangeSupportHint({ hintKey, subjectKey }: EmailChangeSupportHintProps) {
  const { t } = useTranslation('settings')
  const supportEmail = clientEnv.VITE_SUPPORT_EMAIL

  return (
    <p className="mt-2 text-sm text-ink-muted">
      <Trans
        i18nKey={hintKey}
        ns="settings"
        values={{ supportEmail }}
        components={{
          supportLink: (
            <a
              href={`mailto:${supportEmail}?subject=${encodeURIComponent(t(subjectKey))}`}
              className="font-medium text-ink underline decoration-hairline underline-offset-2 transition-colors hover:decoration-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
            />
          ),
        }}
      />
    </p>
  )
}
