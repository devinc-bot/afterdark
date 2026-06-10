import type { Meta, StoryObj } from '@storybook/react-vite'
import { Label } from './label'
import { Input } from './input'

const meta = {
  title: 'UI/Label',
  component: Label,
  tags: ['autodocs'],
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Nombre del producto',
  },
}

export const WithInput: Story = {
  render: () => (
    <div className="flex w-96 max-w-full flex-col gap-2">
      <Label htmlFor="product-name">Nombre del producto</Label>
      <Input id="product-name" placeholder="Ej. Sillón Oslo" />
    </div>
  ),
}

export const Field: Story = {
  args: {
    variant: 'field',
    children: 'Información adicional',
  },
}
