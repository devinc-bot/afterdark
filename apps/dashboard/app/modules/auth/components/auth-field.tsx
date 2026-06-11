import type { ReactNode } from 'react'
import { Label, cn } from '@afterdark/ui'

interface AuthFieldProps {
  label: string
  htmlFor: string
  icon?: ReactNode
  error?: string | null
  labelAction?: ReactNode
  children: ReactNode
  className?: string
}

export function AuthField({
  label,
  htmlFor,
  icon,
  error,
  labelAction,
  children,
  className,
}: AuthFieldProps) {
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
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant [&_svg]:size-5"
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
