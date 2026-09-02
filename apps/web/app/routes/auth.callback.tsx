import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { WEB_ROUTES } from '~/modules/common/constants/routes'
import { useSessionStore } from '~/modules/common/stores/session.store'
import { saveAuthSession } from '~/modules/auth/utils/auth-storage.utils'

type AuthCallbackSearch = {
  token?: string
}

export const Route = createFileRoute('/auth/callback')({
  validateSearch: (search: Record<string, unknown>): AuthCallbackSearch => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  component: AuthCallbackPage,
})

function AuthCallbackPage() {
  const { token } = Route.useSearch()
  const navigate = useNavigate()
  const { t } = useTranslation('auth')
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    async function complete() {
      if (!token) {
        await navigate({
          to: WEB_ROUTES.login(),
          search: { error: 'google_failed' },
          replace: true,
        })
        return
      }

      saveAuthSession({ accessToken: token })
      await useSessionStore.getState().loadSession()
      await navigate({ to: WEB_ROUTES.home(), replace: true })
    }

    void complete()
  }, [navigate, token])

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <p className="text-sm text-on-surface-variant">{t('login.submitting')}</p>
    </main>
  )
}
