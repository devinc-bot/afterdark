import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { Label } from './label'

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
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={htmlFor} variant="field">
          {label}
        </Label>
        {labelAction}
      </div>
      <div className="relative">
        {icon ? (
          <span
            aria-hidden
            className="pointer-events-none absolute left-6 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center text-on-surface-variant [&_svg]:size-7 [&_svg]:shrink-0 [&_svg]:stroke-[1.75]"
          >
            {icon}
          </span>
        ) : null}
        {children}
      </div>
      {error ? (
        <p id={`${htmlFor}-error`} className="text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
