import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  [
    'inline-flex max-w-full items-center rounded-pill font-label uppercase leading-none whitespace-nowrap',
    'transition-[color,background-color,border-color,box-shadow,opacity] duration-(--duration-instant) ease-(--ease-emphasized)',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    'motion-reduce:transition-none',
  ],
  {
    variants: {
      variant: {
        default:
          'cn-gradient-border cn-gradient-border--badge cn-gradient-border--badge-default text-ink',
        secondary:
          'cn-gradient-border cn-gradient-border--badge cn-gradient-border--badge-secondary text-on-secondary',
        destructive:
          'cn-gradient-border cn-gradient-border--badge cn-gradient-border--badge-destructive text-white',
        outline: 'border border-hairline-strong bg-surface-card text-ink',
      },
      size: {
        default: 'gap-1.5 px-2.5 py-1 text-sm font-medium tracking-label-sm [&_svg]:size-3',
        sm: 'gap-1 px-2 py-1 text-xs font-semibold tracking-label-xs [&_svg]:size-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon ? (
        <span className="inline-flex shrink-0 items-center justify-center" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
