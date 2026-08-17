import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AppLogo, Avatar, AvatarFallback, Button, ThemeToggle } from '@repo/ui'
import { useTranslation } from 'react-i18next'
import { clearAuthenticatedState } from '~/modules/auth/utils/sign-out.utils'
import { LanguageSwitcher } from '~/modules/common/components/language-switcher'
import { ADMIN_ROUTES } from '~/modules/common/constants/routes'
import { useSession } from '~/modules/common/hooks/use-session'

function getEmailInitial(email: string): string {
  return email.charAt(0).toUpperCase()
}

export function AdminHome() {
  const { t } = useTranslation(['admin', 'common'])
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useSession()

  const handleSignOut = async () => {
    clearAuthenticatedState(queryClient)
    await navigate({ to: ADMIN_ROUTES.login() })
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-dvh bg-background text-ink">
      <header className="border-b border-hairline bg-surface-container-low/70">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <AppLogo className="size-7 shrink-0" />
            <div className="min-w-0">
              <p className="truncate font-label text-sm font-semibold tracking-label-sm text-ink">
                {t('common:appNameAdmin')}
              </p>
              <p className="text-xs text-ink-muted">{t('home.label')}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="hidden items-center gap-2 border-l border-hairline pl-3 sm:flex">
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary-container text-xs font-semibold text-on-primary-container">
                  {getEmailInitial(user.email)}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-48 truncate text-sm text-ink-muted">{user.email}</span>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => void handleSignOut()}>
              {t('nav.signOut')}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl items-center px-5 py-16 sm:px-8">
        <section className="w-full border-y border-hairline py-10 sm:py-14">
          <div className="max-w-2xl">
            <p className="font-label text-sm font-medium text-primary">{t('home.label')}</p>
            <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-balance text-ink sm:text-5xl">
              {t('home.title')}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
              {t('home.description')}
            </p>
            <p className="mt-8 text-sm text-ink-muted sm:hidden">{user.email}</p>
          </div>
        </section>
      </main>
    </div>
  )
}
