import { useCallback, useRef, useState } from 'react'
import { LogOut, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import type { SessionResponse } from '@repo/types'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  cn,
} from '@repo/ui'
import { clearAuthSession } from '~/modules/auth/utils/auth-storage.utils'
import { SignOutDialog } from '~/modules/common/components/sign-out-dialog'
import { WEB_ROUTES } from '~/modules/common/constants/routes'
import { useSession } from '~/modules/common/hooks/use-session'
import { getUserInitials } from '~/modules/common/utils/user-initials.utils'

const TRIGGER_FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink'

export type UserMenuProps = {
  user: SessionResponse
  ariaLabel: string
  settingsHref: string
}

export function UserMenu({ user, ariaLabel, settingsHref }: UserMenuProps) {
  const { t } = useTranslation('landing')
  const navigate = useNavigate()
  const { clearSession } = useSession()
  const [signOutOpen, setSignOutOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const signOutInFlight = useRef(false)

  const displayName = `${user.name} ${user.lastName}`.trim() || t('userMenu.fallbackName')
  const initials = getUserInitials(user.name, user.lastName)

  const handleSettings = useCallback(() => {
    void navigate({ to: settingsHref })
  }, [navigate, settingsHref])

  const handleSignOut = useCallback(async () => {
    if (signOutInFlight.current) return

    signOutInFlight.current = true
    setIsSigningOut(true)

    try {
      clearAuthSession()
      clearSession()
      setSignOutOpen(false)
      await navigate({ to: WEB_ROUTES.home() })
    } finally {
      signOutInFlight.current = false
      setIsSigningOut(false)
    }
  }, [clearSession, navigate])

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex size-11 cursor-pointer items-center justify-center rounded-full text-on-surface transition-opacity duration-(--duration-instant) ease-emphasized hover:opacity-80',
              TRIGGER_FOCUS_RING
            )}
            aria-label={ariaLabel}
          >
            <Avatar className="size-9 shrink-0" aria-hidden="true">
              {user.avatar ? <AvatarImage src={user.avatar} alt="" /> : null}
              <AvatarFallback className="bg-surface-container text-xs font-medium text-on-surface">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-56 rounded-lg" align="end" sideOffset={4}>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="size-9 shrink-0" aria-hidden="true">
                {user.avatar ? <AvatarImage src={user.avatar} alt="" /> : null}
                <AvatarFallback className="bg-surface-container text-xs font-medium text-on-surface">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-on-surface">{displayName}</span>
                <span className="truncate text-xs text-on-surface-variant">{user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="focus:bg-card" onClick={handleSettings}>
              <User />
              {t('userMenu.settings')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="focus:bg-card" onClick={() => setSignOutOpen(true)}>
            <LogOut />
            {t('userMenu.signOut')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        onConfirm={handleSignOut}
        isSigningOut={isSigningOut}
      />
    </>
  )
}
