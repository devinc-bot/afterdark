import { useTranslation } from 'react-i18next'
import { Button, GoogleMark } from '@repo/ui'
import { buildGoogleOauthStartUrl } from '@repo/common'
import { AUTH_OAUTH_APP, USER_ROLE } from '@repo/types'
import { API_URL } from '~/config/api'

export function GoogleContinueButton() {
  const { t } = useTranslation('auth')

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      onClick={() => {
        window.location.assign(
          buildGoogleOauthStartUrl({ role: USER_ROLE.USER, app: AUTH_OAUTH_APP.WEB, apiUrl: API_URL })
        )
      }}
    >
      <GoogleMark className="size-4.5" />
      {t('google.continue')}
    </Button>
  )
}

export function AuthMethodSeparator() {
  const { t } = useTranslation('auth')

  return (
    <div className="relative flex items-center gap-3 py-1" role="separator">
      <div className="h-px flex-1 bg-hairline" />
      <span className="text-xs text-on-surface-variant">{t('google.or')}</span>
      <div className="h-px flex-1 bg-hairline" />
    </div>
  )
}
