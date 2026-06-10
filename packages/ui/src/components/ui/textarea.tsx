import * as React from 'react'
import { cn } from '../../lib/utils'

const textareaClassName =
  'flex min-h-[120px] w-full resize-y rounded-md border bg-surface-container-lowest px-4 py-3 text-base text-ink tracking-[0.16px] placeholder:text-ink-muted-soft focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:resize-none disabled:bg-surface-container-low disabled:text-ink-muted-soft disabled:opacity-60'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, disabled, id, ...props }, ref) => {
    const generatedId = React.useId()
    const textareaId = id ?? generatedId
    const errorId = error ? `${textareaId}-error` : undefined
    const hasError = Boolean(error)

    const field = (
      <textarea
        id={textareaId}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={errorId}
        className={cn(
          textareaClassName,
          hasError
            ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40'
            : 'border-hairline-strong focus-visible:border-ink focus-visible:ring-ink',
          className
        )}
        ref={ref}
        {...props}
      />
    )

    if (!error) {
      return field
    }

    return (
      <div className="flex flex-col gap-1.5">
        {field}
        <p id={errorId} role="alert" className="text-xs text-error">
          {error}
        </p>
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
