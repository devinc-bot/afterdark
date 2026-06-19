import * as React from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const inputClassName =
  'cn-gradient-border cn-gradient-border--field flex h-9 w-full rounded-lg px-4 text-sm text-ink file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink placeholder:text-ink-muted-soft transition-[box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 read-only:cursor-not-allowed read-only:opacity-80 aria-invalid:focus-visible:ring-error/25 disabled:cursor-not-allowed disabled:text-ink-muted-soft disabled:opacity-60 motion-reduce:transition-none'

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return <input type={type} className={cn(inputClassName, className)} ref={ref} {...props} />
  }
)
Input.displayName = 'Input'

export { Input }
