import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const textareaVariants = cva(
  'flex min-h-[120px] w-full resize-y rounded-md border px-4 py-3 text-[16px] text-ink tracking-[0.16px] placeholder:text-ink-muted-soft focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:resize-none',
  {
    variants: {
      variant: {
        default:
          'border-hairline-strong bg-surface-card focus-visible:border-ink focus-visible:ring-ink disabled:opacity-50',
        secondary:
          'border-hairline-strong bg-surface-container-lowest focus-visible:border-ink focus-visible:ring-ink disabled:bg-surface-container-low disabled:text-ink-muted-soft disabled:opacity-60',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, VariantProps<typeof textareaVariants> {
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, disabled, id, variant, ...props }, ref) => {
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
          textareaVariants({ variant }),
          hasError &&
            'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40',
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

export { Textarea, textareaVariants }
