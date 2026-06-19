import { CircleCheck, Info, Loader2, OctagonX, TriangleAlert } from 'lucide-react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const iconClassName = 'size-7 shrink-0'

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: (
          <CircleCheck
            className={`${iconClassName} text-[#4ade80]`}
            strokeWidth={2.25}
            aria-hidden="true"
          />
        ),
        info: (
          <Info
            className={`${iconClassName} text-[#fbbf24]`}
            strokeWidth={2.25}
            aria-hidden="true"
          />
        ),
        warning: (
          <TriangleAlert
            className={`${iconClassName} text-[#fb923c]`}
            strokeWidth={2.25}
            aria-hidden="true"
          />
        ),
        error: (
          <OctagonX
            className={`${iconClassName} text-[#ff6b6b]`}
            strokeWidth={2.25}
            aria-hidden="true"
          />
        ),
        loading: (
          <Loader2
            className={`${iconClassName} animate-spin text-primary`}
            strokeWidth={2.25}
            aria-hidden="true"
          />
        ),
      }}
      style={
        {
          '--normal-bg': 'var(--color-surface-container-high)',
          '--normal-text': 'var(--color-ink)',
          '--normal-border': 'transparent',
          '--border-radius': 'var(--radius-lg)',
          '--success-bg': 'var(--color-surface-container-high)',
          '--success-text': 'var(--color-ink)',
          '--success-border': 'transparent',
          '--error-bg': 'var(--color-surface-container-high)',
          '--error-text': 'var(--color-ink)',
          '--error-border': 'transparent',
          '--warning-bg': 'var(--color-surface-container-high)',
          '--warning-text': 'var(--color-ink)',
          '--warning-border': 'transparent',
          '--info-bg': 'var(--color-surface-container-high)',
          '--info-text': 'var(--color-ink)',
          '--info-border': 'transparent',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'cn-toast',
          title: 'text-sm font-medium font-label',
          description: 'text-sm text-ink-muted',
          actionButton:
            'bg-primary text-primary-foreground text-xs font-label rounded-md px-3 py-1.5',
          cancelButton:
            'bg-surface-container-high text-ink-muted text-xs font-label rounded-md border border-hairline px-3 py-1.5',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
