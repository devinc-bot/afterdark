import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Select,
  SelectContent,
  SelectField,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './select'

const clubOptions = (
  <>
    <SelectItem value="all">Todos los Clubes</SelectItem>
    <SelectItem value="pulse">Pulse</SelectItem>
    <SelectItem value="after">After</SelectItem>
    <SelectItem value="neon">Neon Room</SelectItem>
  </>
)

const meta = {
  title: 'UI/Select',
  component: SelectField,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof SelectField>

export default meta
type Story = StoryObj<typeof meta>

const fieldShellClassName = 'w-96 max-w-full'

export const Default: Story = {
  render: (args) => (
    <SelectField {...args} containerClassName={fieldShellClassName} defaultValue="all">
      {clubOptions}
    </SelectField>
  ),
  args: {
    label: 'Night Club',
    placeholder: 'Todos los Clubes',
  },
}

export const WithLabel: Story = {
  render: () => (
    <SelectField
      label="Night Club"
      defaultValue="all"
      placeholder="Todos los Clubes"
      containerClassName={fieldShellClassName}
    >
      {clubOptions}
    </SelectField>
  ),
}

export const Disabled: Story = {
  render: () => (
    <SelectField
      label="Night Club"
      defaultValue="all"
      disabled
      containerClassName={fieldShellClassName}
    >
      {clubOptions}
    </SelectField>
  ),
}

export const WithError: Story = {
  render: () => (
    <SelectField
      label="Night Club"
      placeholder="Todos los Clubes"
      error="Seleccioná un club."
      containerClassName={fieldShellClassName}
    >
      {clubOptions}
    </SelectField>
  ),
}

export const GroupedOptions: Story = {
  render: () => (
    <SelectField
      label="Ambiente"
      defaultValue="living"
      placeholder="Elegir ambiente"
      containerClassName={fieldShellClassName}
    >
      <SelectGroup>
        <SelectLabel>Ambientes</SelectLabel>
        <SelectItem value="living">Living</SelectItem>
        <SelectItem value="dormitorio">Dormitorio</SelectItem>
        <SelectItem value="comedor">Comedor</SelectItem>
        <SelectItem value="oficina">Oficina</SelectItem>
      </SelectGroup>
    </SelectField>
  ),
}

export const Primitives: Story = {
  render: () => (
    <Select defaultValue="living">
      <SelectTrigger className="w-96 max-w-full">
        <SelectValue placeholder="Elegir ambiente" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Ambientes</SelectLabel>
          <SelectItem value="living">Living</SelectItem>
          <SelectItem value="dormitorio">Dormitorio</SelectItem>
          <SelectItem value="comedor">Comedor</SelectItem>
          <SelectItem value="oficina">Oficina</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}
