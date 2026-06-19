import type { Meta, StoryObj } from '@storybook/react-vite'
import { toast } from 'sonner'
import { Button } from './button'
import { Toaster } from './sonner'

function SonnerShowcase() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      <p className="text-sm text-ink-muted">
        Hacé clic en un botón para disparar el toast. Aparece arriba a la derecha.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => toast.success('Club registrado correctamente')}>Éxito</Button>
        <Button variant="destructive" onClick={() => toast.error('No pudimos registrar el club')}>
          Error
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.info('Los cambios pueden tardar unos segundos.')}
        >
          Info
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.warning('Revisá los datos antes de continuar.')}
        >
          Advertencia
        </Button>
        <Button
          onClick={() => {
            const id = toast.loading('Registrando club…')
            window.setTimeout(() => {
              toast.success('Club registrado correctamente', { id })
            }, 2000)
          }}
        >
          Carga
        </Button>
      </div>
    </div>
  )
}

const meta = {
  title: 'UI/Sonner',
  component: SonnerShowcase,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Notificaciones toast con Sonner. Montá `<Toaster />` una vez en el layout y usá `toast()` desde cualquier pantalla.',
      },
    },
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster position="top-right" />
      </>
    ),
  ],
} satisfies Meta<typeof SonnerShowcase>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Success: Story = {
  render: () => (
    <Button onClick={() => toast.success('Club registrado correctamente')}>Mostrar éxito</Button>
  ),
}

export const ErrorToast: Story = {
  render: () => (
    <Button
      variant="destructive"
      onClick={() => toast.error('No pudimos registrar el club. Intentá de nuevo.')}
    >
      Mostrar error
    </Button>
  ),
}

export const InfoToast: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.info('Los cambios pueden tardar unos segundos.')}
    >
      Mostrar info
    </Button>
  ),
}

export const WarningToast: Story = {
  render: () => (
    <Button
      variant="secondary"
      onClick={() => toast.warning('Revisá los datos antes de continuar.')}
    >
      Mostrar advertencia
    </Button>
  ),
}

export const Loading: Story = {
  render: () => (
    <Button
      onClick={() => {
        const id = toast.loading('Registrando club…')
        window.setTimeout(() => {
          toast.success('Club registrado correctamente', { id })
        }, 2000)
      }}
    >
      Mostrar carga
    </Button>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <Button
      onClick={() =>
        toast.error('No pudimos registrar el club', {
          description: 'Verificá la conexión e intentá de nuevo en unos minutos.',
        })
      }
    >
      Error con descripción
    </Button>
  ),
}
