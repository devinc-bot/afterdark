import { useTranslation } from 'react-i18next'
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@repo/ui'
import { ChevronsUpDown, LogOut } from 'lucide-react'

function getEmailInitial(email: string): string {
  const trimmed = email.trim()
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?'
}

function getUserDisplayName(user: SessionResponse, fallbackName: string): string {
  const fullName = `${user.name ?? ''} ${user.lastName ?? ''}`.trim()
  return fullName || user.email.trim() || fallbackName
}

export function AppShellUser({
  user,
  onSignOut,
}: {
  user: SessionResponse | null
  onSignOut: () => void
}) {
  const { t } = useTranslation('admin')
  const { isMobile } = useSidebar()

  if (!user) return null

  const displayName = getUserDisplayName(user, t('user.fallbackName'))
  const initials = getEmailInitial(user.email)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8">
                {user.avatar ? <AvatarImage src={user.avatar} alt={displayName} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="p-1">
                  {user.avatar ? <AvatarImage src={user.avatar} alt={displayName} /> : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="rounded-sm text-error focus:text-error"
                onClick={onSignOut}
              >
                <LogOut />
                {t('nav.signOut')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
