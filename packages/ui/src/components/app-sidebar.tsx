import type * as React from 'react'
import { Link } from '@tanstack/react-router'
import { NavMain, type NavMainItem } from './nav-main'
import { NavSecondary, type NavSecondaryItem } from './nav-secondary'
import { NavUser, type NavUserData } from './nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar'

export type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  brand: {
    name: string
    subtitle?: string
    href?: string
    icon?: React.ReactNode
  }
  navMain: NavMainItem[]
  navMainLabel?: string
  navSecondary?: NavSecondaryItem[]
  user?: NavUserData | null
  userMenu?: {
    accountLabel: string
    signOutLabel: string
    onAccount?: () => void
    onSignOut?: () => void
  }
  headerExtra?: React.ReactNode
  footerExtra?: React.ReactNode
  onNavigate?: () => void
}

export function AppSidebar({
  brand,
  navMain,
  navMainLabel,
  navSecondary,
  user,
  userMenu,
  headerExtra,
  footerExtra,
  onNavigate,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to={brand.href} onClick={onNavigate}>
                {brand.icon ? (
                  <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-xl">
                    {brand.icon}
                  </div>
                ) : null}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{brand.name}</span>
                  {brand.subtitle ? (
                    <span className="truncate text-xs">{brand.subtitle}</span>
                  ) : null}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {headerExtra}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} label={navMainLabel} onNavigate={onNavigate} />
        {navSecondary?.length ? <NavSecondary items={navSecondary} className="mt-auto" /> : null}
      </SidebarContent>
      <SidebarFooter>
        {footerExtra}
        {user && userMenu ? (
          <NavUser
            user={user}
            accountLabel={userMenu.accountLabel}
            signOutLabel={userMenu.signOutLabel}
            onAccount={userMenu.onAccount}
            onSignOut={userMenu.onSignOut}
          />
        ) : null}
      </SidebarFooter>
    </Sidebar>
  )
}

export type { NavMainItem, NavSecondaryItem, NavUserData }
