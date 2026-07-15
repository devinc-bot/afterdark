import { Input } from '@afterdark/ui'
import type { InputHTMLAttributes } from 'react'

type AuthInputProps = InputHTMLAttributes<HTMLInputElement>

export function AuthInput(props: AuthInputProps) {
  return <Input {...props} />
}
