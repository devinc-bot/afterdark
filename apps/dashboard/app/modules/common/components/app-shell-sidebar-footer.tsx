import type { SessionResponse } from '@afterdark/types'
import { Avatar, AvatarFallback, AvatarImage, Button, cn } from '@afterdark/ui'
import { Link } from '@tanstack/react-router'
import { APP_SHELL_COPY } from '~/modules/common/constants/app-shell.copy'
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
  return (
    <div
      className="flex items-center gap-3 rounded-md px-2 py-2"
      aria-busy="true"
      aria-label={APP_SHELL_COPY.user.loadingProfile}
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
  return (
    <div className="space-y-2 rounded-md px-2 py-2" role="alert">
      <p className="text-xs text-ink-muted">{message ?? APP_SHELL_COPY.session.loadProfileError}</p>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" loading={isRetrying} onClick={onRetry}>
          {APP_SHELL_COPY.session.retry}
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

  const displayName = getUserDisplayName(user, APP_SHELL_COPY.user.fallbackName)
  const initials = getUserInitials(user.name, user.lastName)
  const profileAriaLabel = buildProfileLinkAriaLabel(
    displayName,
    user.email,
    APP_SHELL_COPY.user.profileLinkLabel
  )

  return (
    <Link
      to={settingsHref}
      className={cn(
        'flex min-w-0 items-center gap-3 rounded-md px-2 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 motion-reduce:transition-none',
        isSettingsActive
          ? 'bg-surface-container text-ink'
          : 'text-ink hover:bg-surface-container/70',
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
