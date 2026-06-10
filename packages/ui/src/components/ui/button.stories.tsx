import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'inverse', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Comprar ahora',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Ver catálogo',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Eliminar',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Cancelar',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Pequeño',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Deshabilitado',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="inverse">Inverse</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}
