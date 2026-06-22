import {
  matchesSidebarNavHref,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@afterdark/ui'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { LayoutGrid, LogOut, Martini, Ticket, Users } from 'lucide-react'
import { clearAuthSession } from '~/modules/auth/utils/auth-storage.utils'
import { AppShellSidebarFooter } from '~/modules/common/components/app-shell-sidebar-footer'
import { AppShellSignOutDialog } from '~/modules/common/components/app-shell-sign-out-dialog'
import { APP_SHELL_COPY } from '~/modules/common/constants/app-shell.copy'
import { useSession } from '~/modules/common/hooks/use-session'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'

const USERS_ROUTE_ENABLED = false

type AppShellNavItem = {
  label: string
  icon: ReactNode
  href?: string
  onClick?: () => void
  disabled?: boolean
  title?: string
}

function buildPrimaryNav(): AppShellNavItem[] {
  return [
    {
      label: APP_SHELL_COPY.nav.panel,
      href: DASHBOARD_ROUTES.home(),
      icon: <LayoutGrid aria-hidden="true" />,
    },
    {
      label: APP_SHELL_COPY.nav.clubs,
      href: DASHBOARD_ROUTES.clubManagement(),
      icon: <Martini aria-hidden="true" />,
    },
    {
      label: APP_SHELL_COPY.nav.tickets,
      href: DASHBOARD_ROUTES.tickets(),
      icon: <Ticket aria-hidden="true" />,
    },
    {
      label: APP_SHELL_COPY.nav.users,
      icon: <Users aria-hidden="true" />,
      disabled: !USERS_ROUTE_ENABLED,
      title: USERS_ROUTE_ENABLED ? undefined : APP_SHELL_COPY.nav.usersUnavailable,
    },
  ]
}

function buildSecondaryNav(onSignOut: () => void): AppShellNavItem[] {
  return [
    {
      label: APP_SHELL_COPY.nav.signOut,
      icon: <LogOut aria-hidden="true" />,
      onClick: onSignOut,
    },
  ]
}

function resolveMobileHeaderTitle(pathname: string, items: AppShellNavItem[]): string {
  const withHref = items.filter(
    (item): item is AppShellNavItem & { href: string } =>
      typeof item.href === 'string' && !item.disabled
  )

  const match = withHref
    .filter((item) => matchesSidebarNavHref(item.href, pathname))
    .sort((left, right) => right.href.length - left.href.length)[0]

  return match?.label ?? APP_SHELL_COPY.mobileFallbackTitle
}

const navMenuButtonClassName = 'gap-3'

function AppShellNavIcon({ icon }: { icon: ReactNode }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center [&_svg]:size-7">{icon}</span>
  )
}

function AppShellNavMenu({
  items,
  pathname,
  onNavigate,
}: {
  items: AppShellNavItem[]
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        if (item.onClick) {
          return (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                size="lg"
                className={navMenuButtonClassName}
                onClick={() => {
                  onNavigate?.()
                  item.onClick?.()
                }}
              >
                {item.icon ? <AppShellNavIcon icon={item.icon} /> : null}
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        }

        if (item.disabled || !item.href) {
          return (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                size="lg"
                className={navMenuButtonClassName}
                disabled
                tooltip={item.title}
                aria-disabled
              >
                {item.icon ? <AppShellNavIcon icon={item.icon} /> : null}
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        }

        const isActive = matchesSidebarNavHref(item.href, pathname)

        return (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              size="lg"
              className={navMenuButtonClassName}
              isActive={isActive}
              tooltip={item.title}
            >
              <Link
                to={item.href}
                onClick={onNavigate}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon ? <AppShellNavIcon icon={item.icon} /> : null}
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

function AppShellLayout({ children }: { children: React.ReactNode }) {
  const [signOutOpen, setSignOutOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const signOutInFlight = useRef(false)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const navigate = useNavigate()
  const { setOpenMobile } = useSidebar()
  const { user, isLoading, error, refresh, clearSession } = useSession()
  const primaryNav = useMemo(() => buildPrimaryNav(), [])
  const settingsHref = DASHBOARD_ROUTES.settings()

  const handleSignOut = useCallback(async () => {
    if (signOutInFlight.current) return

    signOutInFlight.current = true
    setIsSigningOut(true)

    try {
      clearAuthSession()
      clearSession()
      setSignOutOpen(false)
      await navigate({ to: DASHBOARD_ROUTES.login() })
    } finally {
      signOutInFlight.current = false
      setIsSigningOut(false)
    }
  }, [clearSession, navigate])

  const closeMobileSidebar = useCallback(() => {
    setOpenMobile(false)
  }, [setOpenMobile])

  const openSignOutDialog = useCallback(() => {
    closeMobileSidebar()
    setSignOutOpen(true)
  }, [closeMobileSidebar])

  const secondaryNav = useMemo(() => buildSecondaryNav(openSignOutDialog), [openSignOutDialog])

  const mobileHeaderTitle = useMemo(
    () => resolveMobileHeaderTitle(pathname, [...primaryNav, ...secondaryNav]),
    [pathname, primaryNav, secondaryNav]
  )

  const isSettingsActive = matchesSidebarNavHref(settingsHref, pathname)

  return (
    <>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="px-4 pt-5 pb-3">
          <span className="font-heading text-base font-semibold tracking-[0.04em] text-sidebar-foreground">
            {APP_SHELL_COPY.brand.logo}
          </span>
          <p className="text-sm text-sidebar-foreground/70">{APP_SHELL_COPY.brand.subtitle}</p>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <AppShellNavMenu
                items={primaryNav}
                pathname={pathname}
                onNavigate={closeMobileSidebar}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="gap-4">
          <AppShellSidebarFooter
            user={user}
            isLoading={isLoading}
            error={error}
            settingsHref={settingsHref}
            isSettingsActive={isSettingsActive}
            onNavigate={closeMobileSidebar}
            onRetry={() => void refresh()}
            isRetrying={isLoading}
          />
          <AppShellNavMenu
            items={secondaryNav}
            pathname={pathname}
            onNavigate={closeMobileSidebar}
          />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-hairline bg-surface-container-lowest px-4 py-3 md:hidden">
          <SidebarTrigger />
          <p className="min-w-0 truncate text-sm font-medium text-ink">{mobileHeaderTitle}</p>
        </header>
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </SidebarInset>

      <AppShellSignOutDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        onConfirm={handleSignOut}
        isSigningOut={isSigningOut}
      />
    </>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppShellLayout>{children}</AppShellLayout>
    </SidebarProvider>
  )
}
