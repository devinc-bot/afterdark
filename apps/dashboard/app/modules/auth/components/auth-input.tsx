import { Input, cn } from '@afterdark/ui'
import type { InputHTMLAttributes } from 'react'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasIcon?: boolean
}

export function AuthInput({ className, hasIcon = false, ...props }: AuthInputProps) {
  return (
    <Input
      className={cn(
        'h-auto rounded-lg border-white/10 bg-black py-3 font-mono text-base text-on-surface placeholder:text-white/20 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-0',
        hasIcon ? 'pl-10 pr-4' : 'px-4',
        className
      )}
      {...props}
    />
  )
}
