import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { LayoutGrid, LogOut, Martini, Settings, Ticket, Users } from 'lucide-react'
import { SidebarNav, SidebarNavMenuButton, type SidebarNavItem } from './sidebar-nav'

const meta = {
  title: 'UI/SidebarNav',
  component: SidebarNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'responsive',
    },
  },
} satisfies Meta<typeof SidebarNav>

export default meta
type Story = StoryObj<typeof meta>

const primaryNav: SidebarNavItem[] = [
  {
    label: 'Panel',
    href: '/dashboard',
    icon: <LayoutGrid aria-hidden="true" />,
  },
  {
    label: 'Clubes',
    href: '/clubs',
    icon: <Martini aria-hidden="true" />,
  },
  {
    label: 'Entradas',
    href: '/tickets',
    icon: <Ticket aria-hidden="true" />,
  },
  {
    label: 'Usuarios',
    href: '/users',
    icon: <Users aria-hidden="true" />,
    disabled: true,
    title: 'Usuarios — próximamente disponible',
  },
]

const secondaryNav: SidebarNavItem[] = [
  {
    label: 'Configuración',
    href: '/settings',
    icon: <Settings aria-hidden="true" />,
  },
  {
    label: 'Cerrar sesión',
    href: '/logout',
    icon: <LogOut aria-hidden="true" />,
  },
]

const navArgs = {
  logo: 'AFTERDARK',
  title: 'Panel operativo',
  activeHref: '/dashboard',
  primary: primaryNav,
  secondary: secondaryNav,
}

function ResponsiveSidebarDemo(args: React.ComponentProps<typeof SidebarNav>) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-surface">
      <SidebarNav {...args} open={open} onOpenChange={setOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-hairline bg-surface-container-lowest px-4 py-3 lg:hidden">
          <SidebarNavMenuButton open={open} onOpenChange={setOpen} />
          <p className="truncate text-sm font-medium text-ink">Panel</p>
        </header>
        <main className="p-6 text-ink-muted">Contenido principal</main>
      </div>
    </div>
  )
}

export const ManagementHub: Story = {
  args: navArgs,
  render: (args) => <ResponsiveSidebarDemo {...args} />,
}

export const WithImageLogo: Story = {
  args: {
    ...navArgs,
    logo: {
      src: 'https://placehold.co/160x32/ECB1FF/4A1A5E?text=AFTERDARK',
      alt: 'Afterdark',
    },
    activeHref: '/clubs',
  },
  render: (args) => <ResponsiveSidebarDemo {...args} />,
}
