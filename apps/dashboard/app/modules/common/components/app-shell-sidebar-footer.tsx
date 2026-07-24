import { useTranslation } from 'react-i18next'
import type { SessionResponse } from '@afterdark/types'
import { Avatar, AvatarFallback, AvatarImage, Button, cn } from '@afterdark/ui'
import { Link } from '@tanstack/react-router'
import {
  buildProfileLinkAriaLabel,
  getUserDisplayName,
  getUserInitials,
} from '~/modules/common/utils/app-shell-user.utils'

type AppShellSidebarFooterProps = {
  user: SessionResponse | null
  isLoading: boolean
  error: string | null
  settingsHref: string
  isSettingsActive: boolean
  onNavigate?: () => void
  onRetry?: () => void
  isRetrying?: boolean
}

function AppShellSidebarFooterSkeleton() {
  const { t } = useTranslation('dashboard')

  return (
    <div
      className="flex items-center gap-3 rounded-md px-2 py-2"
      aria-busy="true"
      aria-label={t('user.loadingProfile')}
    >
      <span className="size-9 shrink-0 animate-pulse rounded-full bg-surface-container motion-reduce:animate-none" />
      <span className="min-w-0 flex-1 space-y-1.5">
        <span className="block h-3.5 w-24 animate-pulse rounded bg-surface-container motion-reduce:animate-none" />
        <span className="block h-3 w-32 animate-pulse rounded bg-surface-container motion-reduce:animate-none" />
      </span>
    </div>
  )
}

function AppShellSidebarFooterError({
  message,
  onRetry,
  isRetrying,
}: {
  message: string | null
  onRetry?: () => void
  isRetrying?: boolean
}) {
  const { t } = useTranslation('dashboard')

  return (
    <div className="space-y-2 rounded-md px-2 py-2" role="alert">
      <p className="text-xs text-ink-muted">{message ?? t('session.loadProfileError')}</p>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" loading={isRetrying} onClick={onRetry}>
          {t('session.retry')}
        </Button>
      ) : null}
    </div>
  )
}

export function AppShellSidebarFooter({
  user,
  isLoading,
  error,
  settingsHref,
  isSettingsActive,
  onNavigate,
  onRetry,
  isRetrying = false,
}: AppShellSidebarFooterProps) {
  const { t } = useTranslation('dashboard')

  if (isLoading && !user) {
    return <AppShellSidebarFooterSkeleton />
  }

  if (!user) {
    if (error) {
      return (
        <AppShellSidebarFooterError message={error} onRetry={onRetry} isRetrying={isRetrying} />
      )
    }

    return null
  }

  const displayName = getUserDisplayName(user, t('user.fallbackName'))
  const initials = getUserInitials(user.name, user.lastName)
  const profileAriaLabel = buildProfileLinkAriaLabel(
    displayName,
    user.email,
    t('user.profileLinkLabel')
  )

  const selectedItemClassName = cn(
    'bg-surface-container text-ink',
    'relative before:pointer-events-none before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:origin-center before:scale-y-100 before:rounded-full before:bg-primary before:content-[""]',
    'before:transition-transform before:duration-(--duration-fast) before:ease-[cubic-bezier(0.22,1,0.36,1)]',
    'motion-reduce:before:transition-none'
  )
  const itemClassName = cn(
    'relative text-ink hover:bg-surface-container/70',
    'before:pointer-events-none before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:origin-center before:scale-y-0 before:rounded-full before:bg-primary before:content-[""]',
    'before:transition-transform before:duration-(--duration-fast) before:ease-[cubic-bezier(0.22,1,0.36,1)]',
    'motion-reduce:before:transition-none'
  )

  return (
    <Link
      to={settingsHref}
      className={cn(
        'flex min-w-0 items-center gap-3 px-2 py-2 transition-colors duration-(--duration-fast) ease-emphasized focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 motion-reduce:transition-none',
        isSettingsActive ? selectedItemClassName : itemClassName,
        isLoading && 'pointer-events-none opacity-70'
      )}
      aria-label={profileAriaLabel}
      aria-current={isSettingsActive ? 'page' : undefined}
      aria-busy={isLoading || undefined}
      onClick={onNavigate}
    >
      <Avatar className="size-9 shrink-0" aria-hidden="true">
        {user.avatar ? <AvatarImage src={user.avatar} alt="" /> : null}
        <AvatarFallback className="bg-surface-container text-sm font-medium text-ink">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium" title={displayName}>
          {displayName}
        </span>
        <span className="block truncate text-xs text-ink-muted" title={user.email}>
          {user.email}
        </span>
      </span>
    </Link>
  )
}
