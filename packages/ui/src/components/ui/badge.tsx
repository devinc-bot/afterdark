import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-pill font-semibold uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ink [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-surface-strong text-ink',
        secondary: 'border-transparent bg-secondary text-on-secondary',
        destructive: 'border-transparent bg-destructive text-white',
        outline: 'border border-hairline-strong bg-surface-card text-ink',
      },
      size: {
        default: 'gap-1.5 px-2.5 py-1 text-sm tracking-label-sm [&_svg]:size-3',
        sm: 'gap-1 px-2 py-0.5 text-xs tracking-label-xs [&_svg]:size-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
