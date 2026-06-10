import type { Meta, StoryObj } from '@storybook/react-vite'
import { Typography } from './typography'

const meta = {
  title: 'UI/Typography',
  component: Typography,
  tags: ['autodocs'],
  argTypes: {
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'p', 'span'],
    },
    size: {
      control: 'select',
      options: ['heading', 'title', 'subtitle', 'body', 'small', 'default'],
    },
    theme: {
      control: 'select',
      options: ['default', 'error', 'success', 'warning'],
    },
  },
} satisfies Meta<typeof Typography>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Texto de ejemplo para el catálogo Indumuebles.',
  },
}

export const Title: Story = {
  args: {
    as: 'h2',
    size: 'title',
    children: 'Muebles con diseño atemporal',
  },
}

export const Error: Story = {
  args: {
    size: 'body',
    theme: 'error',
    children: 'No se pudo cargar el producto.',
  },
}

export const AllSizes: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-lg flex-col gap-3">
      <Typography as="h1" size="title">
        Título principal
      </Typography>
      <Typography as="h2" size="subtitle">
        Subtítulo
      </Typography>
      <Typography size="body">
        Cuerpo de texto para descripciones y párrafos en fichas de producto.
      </Typography>
      <Typography size="small">Texto auxiliar o metadata</Typography>
      <Typography theme="success">Operación exitosa</Typography>
      <Typography theme="warning">Stock limitado</Typography>
      <Typography theme="error">Error al guardar</Typography>
    </div>
  ),
}
