import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from './button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

const meta = {
  title: 'UI/Tooltip',
  component: TooltipContent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    children: { control: 'text' },
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
    },
    sideOffset: { control: 'number' },
  },
} satisfies Meta<typeof TooltipContent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Pasar el cursor</Button>
        </TooltipTrigger>
        <TooltipContent {...args} />
      </Tooltip>
    </TooltipProvider>
  ),
  args: {
    children: 'Agregar club',
    side: 'top',
  },
}

export const IconButton: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-lg"
            aria-label="Agregar club"
          >
            <Plus aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Agregar club</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}

export const ActionButtons: Story = {
  render: () => (
    <TooltipProvider>
      <div className="flex flex-col gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-ink-muted hover:text-ink"
              aria-label="Editar club"
            >
              <Pencil aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Editar club</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-ink-muted hover:text-error"
              aria-label="Eliminar club"
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Eliminar club</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
}

export const AllSides: Story = {
  render: () => (
    <TooltipProvider>
      <div className="grid grid-cols-2 gap-16 p-16">
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <Tooltip key={side}>
            <TooltipTrigger asChild>
              <Button variant="outline">{side}</Button>
            </TooltipTrigger>
            <TooltipContent side={side}>Tooltip {side}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
  parameters: {
    layout: 'padded',
  },
}
