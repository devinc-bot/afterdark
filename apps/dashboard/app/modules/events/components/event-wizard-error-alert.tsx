import { AlertCircle } from 'lucide-react'
import { cn } from '@afterdark/ui'

type EventWizardErrorAlertProps = {
  message: string
  title?: string
  className?: string
}

export function EventWizardErrorAlert({ message, title, className }: EventWizardErrorAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-xl border border-error/40 bg-error-container/20 px-4 py-3',
        className
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" aria-hidden="true" />
      <div className="min-w-0 text-sm">
        {title ? <p className="font-medium text-error">{title}</p> : null}
        <p className={cn('text-pretty wrap-break-word text-ink', title && 'mt-0.5 text-ink-muted')}>
          {message}
        </p>
      </div>
    </div>
  )
}
