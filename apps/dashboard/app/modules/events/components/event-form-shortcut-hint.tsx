import { useEffect, useState } from 'react'
import { cn } from '@afterdark/ui'

type EventFormShortcutHintProps = {
  label: string
  className?: string
}

export function EventFormShortcutHint({ label, className }: EventFormShortcutHintProps) {
  const [modifier, setModifier] = useState<string | null>(null)

  useEffect(() => {
    const platform = navigator.platform || navigator.userAgent || ''
    setModifier(/Mac|iPhone|iPad|iPod/i.test(platform) ? '\u2318' : 'Ctrl')
  }, [])

  if (!modifier) return null

  return (
    <p className={cn('hidden items-center gap-1.5 text-sm text-ink-muted-soft sm:flex', className)}>
      <Key>{modifier}</Key>
      <Key>Enter</Key>
      <span className="ml-0.5">{label}</span>
    </p>
  )
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-hairline bg-surface-container-low px-1.5 font-label text-xs font-medium text-ink-muted">
      {children}
    </kbd>
  )
}
