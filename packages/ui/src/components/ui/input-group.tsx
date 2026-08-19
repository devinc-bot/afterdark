'use client'

import * as React from 'react'
import { cn } from '../../lib/utils'
import { Input } from './input'

const InputGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      className={cn(
        'cn-gradient-border cn-gradient-border--field flex h-9 w-full items-center overflow-hidden rounded-app-sm text-ink transition-shadow focus-within:ring-2 focus-within:ring-primary/25',
        className
      )}
      {...props}
    />
  )
)
InputGroup.displayName = 'InputGroup'

function InputGroupAddon({
  className,
  align = 'inline-end',
  ...props
}: React.ComponentProps<'div'> & { align?: 'inline-start' | 'inline-end' }) {
  return (
    <div
      aria-hidden
      className={cn(
        'flex shrink-0 items-center px-3 text-ink-muted-soft [&>svg]:size-7',
        align === 'inline-start' ? 'order-first' : 'order-last',
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        'h-full flex-1 rounded-none border-0 bg-none px-4 shadow-none focus-visible:ring-0 read-only:cursor-pointer disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
}

export { InputGroup, InputGroupAddon, InputGroupInput }
