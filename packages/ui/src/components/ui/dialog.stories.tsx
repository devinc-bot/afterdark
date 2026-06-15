import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'

const meta = {
  title: 'UI/Dialog',
  component: DialogContent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
    },
    showCloseButton: { control: 'boolean' },
  },
} satisfies Meta<typeof DialogContent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir diálogo</Button>
      </DialogTrigger>
      <DialogContent {...args}>
        <DialogHeader>
          <DialogTitle>Agregar club</DialogTitle>
          <DialogDescription>
            Completá los datos para registrar un nuevo club en la plataforma.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  args: {
    size: 'md',
    variant: 'default',
    showCloseButton: true,
  },
}

export const Small: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Diálogo pequeño
        </Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Confirmar acción</DialogTitle>
          <DialogDescription>¿Querés continuar con esta operación?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const Large: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Diálogo grande</Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Detalle del club</DialogTitle>
          <DialogDescription>
            Vista ampliada para formularios o contenido con más espacio horizontal.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-32 rounded-lg border border-hairline bg-surface-container-low p-4 text-sm text-ink-muted">
          Área de contenido
        </div>
      </DialogContent>
    </Dialog>
  ),
}

export const Destructive: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Eliminar club</Button>
      </DialogTrigger>
      <DialogContent variant="destructive" size="sm">
        <DialogHeader>
          <DialogTitle>Eliminar club</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. El club y sus datos asociados se eliminarán
            permanentemente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button variant="destructive">Eliminar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const WithoutCloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Sin botón cerrar</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} size="sm">
        <DialogHeader>
          <DialogTitle>Sesión requerida</DialogTitle>
          <DialogDescription>Usá los botones del pie para cerrar este diálogo.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
