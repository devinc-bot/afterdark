import { Input, cn } from '@afterdark/ui'
import type { InputHTMLAttributes } from 'react'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasIcon?: boolean
}

export function AuthInput({ className, hasIcon = false, ...props }: AuthInputProps) {
  return <Input className={cn(hasIcon ? 'pl-9 pr-4' : undefined, className)} {...props} />
}
