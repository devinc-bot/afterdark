import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@afterdark/ui'
import { useSession } from '~/modules/common/hooks/use-session'
import { getUserInitials } from '~/modules/common/utils/user-initials.utils'
import { LANDING_HEADING, LANDING_SHELL } from '~/modules/landing/constants/layout'

export function SettingsPage() {
  const { t } = useTranslation('settings')
  const { user } = useSession()

  if (!user) {
    return null
  }

  const displayName = `${user.name} ${user.lastName}`.trim() || t('web.profile.avatarFallback')
  const initials = getUserInitials(user.name, user.lastName)

  return (
    <div className={LANDING_SHELL}>
      <div className="mx-auto w-full max-w-lg space-y-8">
        <header className="space-y-2">
          <h1 className={LANDING_HEADING}>{t('web.page.title')}</h1>
          <p className="font-label text-sm text-on-surface-variant">{t('web.comingSoon')}</p>
        </header>

        <section
          aria-label={t('web.page.title')}
          className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8"
        >
          <Avatar className="size-20 shrink-0" aria-hidden="true">
            {user.avatar ? <AvatarImage src={user.avatar} alt="" /> : null}
            <AvatarFallback className="bg-surface-container text-xl font-medium text-on-surface">
              {initials}
            </AvatarFallback>
          </Avatar>

          <dl className="min-w-0 flex-1 space-y-4">
            <div>
              <dt className="font-label text-xs text-on-surface-variant">
                {t('web.profile.name')}
              </dt>
              <dd
                className="mt-0.5 truncate text-base font-medium text-on-surface"
                title={displayName}
              >
                {displayName}
              </dd>
            </div>
            <div>
              <dt className="font-label text-xs text-on-surface-variant">
                {t('web.profile.email')}
              </dt>
              <dd className="mt-0.5 truncate text-base text-on-surface" title={user.email}>
                {user.email}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  )
}
