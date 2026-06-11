import { Input, cn } from '@afterdark/ui'
import type { InputHTMLAttributes } from 'react'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasIcon?: boolean
}

export function AuthInput({ className, hasIcon = false, ...props }: AuthInputProps) {
  return (
    <Input
      className={cn(
        'h-11 rounded-lg border-outline-variant bg-surface-container-low text-base text-on-surface placeholder:text-on-surface-variant/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 aria-invalid:border-error aria-invalid:focus-visible:border-error aria-invalid:focus-visible:ring-error/25',
        hasIcon ? 'pl-9 pr-4' : 'px-4',
        className
      )}
      {...props}
    />
  )
}
