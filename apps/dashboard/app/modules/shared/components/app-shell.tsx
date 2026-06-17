import { SidebarNav, SidebarNavMenuButton } from '@afterdark/ui'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { LayoutGrid, LogOut, Martini, Settings, Ticket, Users } from 'lucide-react'
import { clearAuthSession } from '~/modules/auth/utils/auth-storage.utils'
import { useSession } from '~/modules/shared/hooks/use-session'
import { DASHBOARD_ROUTES } from '~/modules/shared/constants/routes'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const navigate = useNavigate()
  const { clearSession } = useSession()

  const handleLogout = () => {
    clearAuthSession()
    clearSession()
    void navigate({ to: DASHBOARD_ROUTES.login() })
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <SidebarNav
        logo="AFTERDARK"
        title="Management Hub"
        activeHref={pathname}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        primary={[
          {
            label: 'Dashboard',
            href: DASHBOARD_ROUTES.home(),
            icon: <LayoutGrid aria-hidden="true" />,
          },
          {
            label: 'Clubs',
            href: DASHBOARD_ROUTES.clubManagement(),
            icon: <Martini aria-hidden="true" />,
          },
          {
            label: 'Tickets',
            href: DASHBOARD_ROUTES.tickets(),
            icon: <Ticket aria-hidden="true" />,
          },
          {
            label: 'User Management',
            href: DASHBOARD_ROUTES.userManagement(),
            icon: <Users aria-hidden="true" />,
          },
        ]}
        secondary={[
          {
            label: 'Settings',
            href: DASHBOARD_ROUTES.settings(),
            icon: <Settings aria-hidden="true" />,
          },
          {
            label: 'Logout',
            icon: <LogOut aria-hidden="true" />,
            onClick: handleLogout,
          },
        ]}
        renderLink={({ item, isActive, className, children: linkChildren, onNavigate }) => (
          <Link
            to={item.href!}
            className={className}
            aria-current={isActive ? 'page' : undefined}
            onClick={onNavigate}
          >
            {linkChildren}
          </Link>
        )}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-hairline bg-surface-container-lowest px-4 py-3 lg:hidden">
          <SidebarNavMenuButton open={sidebarOpen} onOpenChange={setSidebarOpen} />
          <div className="min-w-0">
            <p className="truncate font-heading text-sm font-bold uppercase tracking-[0.15em] text-primary">
              AFTERDARK
            </p>
            <p className="truncate text-xs text-ink-muted">Management Hub</p>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  )
}
