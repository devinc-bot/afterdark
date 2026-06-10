import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Nuevo',
  },
}

export const WithIcon: Story = {
  args: {
    children: 'Live now',
    icon: <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />,
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'En stock',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Agotado',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  ),
}

export const WithIconExamples: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge icon={<span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}>
        Live now
      </Badge>
      <Badge
        variant="outline"
        icon={<span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />}
      >
        Private
      </Badge>
    </div>
  ),
}
