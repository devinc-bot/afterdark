import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { RichEditor } from './rich-editor'

const meta = {
  title: 'UI/RichEditor',
  component: RichEditor,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[680px] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RichEditor>

export default meta
type Story = StoryObj<typeof meta>

function ControlledEditor() {
  const [value, setValue] = React.useState('<h2>Detalles del evento</h2><p>Escribí acá.</p>')

  return <RichEditor value={value} onChange={setValue} />
}

export const Default: Story = {
  args: {
    defaultValue: '<h2>Detalles del evento</h2><p>Sumá la información más importante.</p>',
  },
}

export const Controlled: Story = {
  render: () => <ControlledEditor />,
}

export const WithError: Story = {
  args: {
    defaultValue: '<p>Muy breve.</p>',
    error: 'Agregá una descripción más completa.',
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: '<p>Este contenido no se puede editar.</p>',
    disabled: true,
  },
}
