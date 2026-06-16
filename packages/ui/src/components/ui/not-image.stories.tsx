import type { Meta, StoryObj } from '@storybook/react-vite'
import { NotImage } from './not-image'

const meta = {
  title: 'UI/NotImage',
  component: NotImage,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'full'],
    },
    label: { control: 'text' },
  },
} satisfies Meta<typeof NotImage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    size: 'md',
    label: 'Sin imagen',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-4">
      <NotImage size="sm" />
      <NotImage size="md" />
      <NotImage size="lg" />
    </div>
  ),
}

export const InCardContext: Story = {
  render: () => (
    <div className="flex items-center gap-4 rounded-xl border border-hairline bg-surface-card p-4">
      <NotImage size="sm" className="sm:size-20 sm:[&_svg]:size-8" />
      <div className="flex flex-col gap-1">
        <p className="font-heading text-sm font-bold uppercase text-ink">Cyber Tokyo</p>
        <p className="text-sm text-ink-muted">Shinjuku District, JP</p>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

export const FullWidth: Story = {
  render: () => (
    <div className="h-48 w-80">
      <NotImage size="full" />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}
