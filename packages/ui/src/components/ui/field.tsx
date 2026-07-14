import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { Label } from './label'

function withFieldDescribedBy(child: ReactNode, errorId: string | undefined): ReactNode {
  if (!errorId || !isValidElement(child)) {
    return child
  }

  const element = child as ReactElement<{ 'aria-describedby'?: string }>
  const describedBy = [element.props['aria-describedby'], errorId].filter(Boolean).join(' ')

  return cloneElement(element, {
    'aria-describedby': describedBy || undefined,
  })
}

export interface FieldProps {
  label: string
  htmlFor: string
  icon?: ReactNode
  error?: string | null
  labelAction?: ReactNode
  children: ReactNode
  className?: string
}

export function Field({
  label,
  htmlFor,
  icon,
  error,
  labelAction,
  children,
  className,
}: FieldProps) {
  const errorId = error ? `${htmlFor}-error` : undefined
  const hasError = Boolean(error)

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={htmlFor} variant="field">
          {label}
        </Label>
        {labelAction}
      </div>
      <div className="group/field relative">
        {icon ? (
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute left-6 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center',
              'transition-colors duration-(--duration-fast) ease-emphasized',
              '[&_svg]:size-7 [&_svg]:shrink-0 [&_svg]:stroke-[1.75]',
              'motion-reduce:transition-none',
              hasError ? 'text-error' : 'text-on-surface-variant group-focus-within/field:text-ink'
            )}
          >
            {icon}
          </span>
        ) : null}
        {withFieldDescribedBy(children, errorId)}
      </div>
      {error ? (
        <p
          id={errorId}
          role="alert"
          className={cn(
            'text-xs text-error',
            'animate-in fade-in-0 slide-in-from-top-1 duration-(--duration-fast)',
            'ease-[cubic-bezier(0.22,1,0.36,1)]',
            'motion-reduce:animate-none'
          )}
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
