import type { Meta, StoryObj } from '@storybook/react-vite'
import { withRouter } from '../../stories/decorators/with-router'
import { Link } from './link'

const meta = {
  title: 'UI/Link',
  component: Link,
  tags: ['autodocs'],
  decorators: [withRouter],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'button',
        'destructive',
        'outline',
        'gradient',
        'inverse',
        'secondary',
        'ghost',
        'link',
      ],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
} satisfies Meta<typeof Link>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    to: '/',
    children: 'Ir al inicio',
  },
}

export const Button: Story = {
  args: {
    to: '/',
    variant: 'button',
    children: 'Crear cuenta',
  },
}

export const Outline: Story = {
  args: {
    to: '/about',
    variant: 'outline',
    children: 'Sobre nosotros',
  },
}

export const AsButtonStyle: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Link to="/" variant="button">
        Button
      </Link>
      <Link to="/about" variant="outline">
        Outline
      </Link>
      <Link to="/" variant="ghost">
        Ghost
      </Link>
      <Link to="/">Default (sin estilo)</Link>
    </div>
  ),
}
