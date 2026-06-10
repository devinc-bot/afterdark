import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './input'
import { Label } from './label'

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

const fieldShellClassName = 'w-96 max-w-full'

export const Default: Story = {
  render: (args) => (
    <div className={fieldShellClassName}>
      <Input {...args} />
    </div>
  ),
  args: {
    placeholder: 'Buscar muebles...',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className={`flex flex-col gap-2 ${fieldShellClassName}`}>
      <Label htmlFor="email">Correo electrónico</Label>
      <Input id="email" type="email" placeholder="nombre@ejemplo.com" />
    </div>
  ),
}

export const Disabled: Story = {
  render: (args) => (
    <div className={fieldShellClassName}>
      <Input {...args} />
    </div>
  ),
  args: {
    disabled: true,
    placeholder: 'No editable',
    value: 'Valor fijo',
  },
}
