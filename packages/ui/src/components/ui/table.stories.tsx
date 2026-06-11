import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './badge'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'

type DemoUser = {
  id: string
  name: string
  email: string
  registeredAt: string
  venue: string
  tickets: number
  role: string
  status: 'active' | 'inactive' | 'banned'
}

const demoUsers: DemoUser[] = [
  {
    id: '1',
    name: 'Aiko Tanaka',
    email: 'aiko.t@afterdark.io',
    registeredAt: 'Oct 12, 2023',
    venue: 'Neon District',
    tickets: 142,
    role: 'Admin',
    status: 'active',
  },
  {
    id: '2',
    name: 'Marco V.',
    email: 'marco.v@pulseclub.com',
    registeredAt: 'Nov 05, 2023',
    venue: 'Pulse Club',
    tickets: 42,
    role: 'Beverage Manager',
    status: 'active',
  },
  {
    id: '3',
    name: 'Sarah Jenkins',
    email: 's.jenkins@email.net',
    registeredAt: 'Jan 20, 2024',
    venue: 'Vault Room',
    tickets: 8,
    role: 'Regular User',
    status: 'inactive',
  },
  {
    id: '4',
    name: 'Dev Null',
    email: 'dev.null@void.sys',
    registeredAt: 'Feb 14, 2024',
    venue: 'The Underworld',
    tickets: 1240,
    role: 'Controller',
    status: 'banned',
  },
]

function UserIdentityCell({ name, email }: { name: string; email: string }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-outline-variant/50 bg-on-primary-container/25 text-xs font-bold text-primary">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink">{name}</p>
        <p className="truncate text-sm text-ink-muted">{email}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: DemoUser['status'] }) {
  const label = status === 'active' ? 'Active' : status === 'inactive' ? 'Inactive' : 'Banned'

  return (
    <Badge
      variant="outline"
      className={
        status === 'active'
          ? 'border-transparent bg-surface-strong text-[#4ade80]'
          : status === 'banned'
            ? 'border-transparent bg-surface-strong text-[#fb923c]'
            : undefined
      }
    >
      {label}
    </Badge>
  )
}

function UsersTable({ variant }: { variant?: 'default' | 'compact' }) {
  return (
    <Table variant={variant} className="w-full max-w-6xl">
      <TableCaption>Listado de usuarios del dashboard.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>User Identity</TableHead>
          <TableHead>Reg. Date</TableHead>
          <TableHead>Primary Venue</TableHead>
          <TableHead>Total Tix</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {demoUsers.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <UserIdentityCell name={user.name} email={user.email} />
            </TableCell>
            <TableCell className="text-ink-muted">{user.registeredAt}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                {user.venue}
              </div>
            </TableCell>
            <TableCell>
              <span className="font-heading text-lg font-bold text-primary shadow-primary-glow">
                {user.tickets.toLocaleString('es-AR')}
              </span>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{user.role}</Badge>
            </TableCell>
            <TableCell>
              <StatusBadge status={user.status} />
            </TableCell>
            <TableCell className="text-right" />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const meta = {
  title: 'UI/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'compact'],
    },
  },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <UsersTable variant="default" />,
}

export const Compact: Story = {
  render: () => <UsersTable variant="compact" />,
}
