import { Loader } from '@afterdark/ui'

export function SessionLoading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background">
      <Loader size={24} />
      <p className="text-sm text-ink-muted">Cargando sesión…</p>
    </div>
  )
}
