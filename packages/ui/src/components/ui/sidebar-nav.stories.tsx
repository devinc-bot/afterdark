import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { LayoutGrid, LogOut, Martini, Settings, Ticket, Users } from 'lucide-react'
import { SidebarNav, SidebarNavMenuButton } from './sidebar-nav'

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

const navArgs = {
  logo: 'AFTERDARK',
  title: 'Management Hub',
  activeHref: '/dashboard',
  primary: [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutGrid aria-hidden="true" />,
    },
    {
      label: 'Clubs',
      href: '/clubs',
      icon: <Martini aria-hidden="true" />,
    },
    {
      label: 'Tickets',
      href: '/tickets',
      icon: <Ticket aria-hidden="true" />,
    },
    {
      label: 'User Management',
      href: '/users',
      icon: <Users aria-hidden="true" />,
    },
  ],
  secondary: [
    {
      label: 'Settings',
      href: '/settings',
      icon: <Settings aria-hidden="true" />,
    },
    {
      label: 'Logout',
      href: '/logout',
      icon: <LogOut aria-hidden="true" />,
    },
  ],
} as const

function ResponsiveSidebarDemo(args: React.ComponentProps<typeof SidebarNav>) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-surface">
      <SidebarNav {...args} open={open} onOpenChange={setOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-hairline bg-surface-container-lowest px-4 py-3 lg:hidden">
          <SidebarNavMenuButton open={open} onOpenChange={setOpen} />
          <p className="font-heading text-sm font-bold uppercase tracking-[0.15em] text-primary">
            AFTERDARK
          </p>
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
