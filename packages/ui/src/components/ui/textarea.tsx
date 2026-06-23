import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const textareaVariants = cva(
  'cn-gradient-border flex min-h-[120px] w-full resize-y rounded-lg px-4 py-3 text-base text-ink placeholder:text-ink-muted-soft transition-[box-shadow] focus-visible:outline-none focus-visible:ring-2 aria-invalid:focus-visible:ring-error/40 disabled:cursor-not-allowed disabled:resize-none motion-reduce:transition-none',
  {
    variants: {
      variant: {
        default:
          'cn-gradient-border--field placeholder:text-ink-muted-soft focus-visible:ring-primary/25 disabled:text-ink-muted-soft disabled:opacity-60',
        secondary:
          'cn-gradient-border--field-secondary focus-visible:ring-ink disabled:text-ink-muted-soft disabled:opacity-60',
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
        className={cn(textareaVariants({ variant }), className)}
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
