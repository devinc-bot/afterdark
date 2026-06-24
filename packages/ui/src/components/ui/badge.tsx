import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'cn-gradient-border cn-gradient-border--badge inline-flex items-center rounded-pill font-semibold uppercase transition-[box-shadow] focus:outline-none focus:ring-2 focus:ring-ink [&_svg]:pointer-events-none [&_svg]:shrink-0 motion-reduce:transition-none',
  {
    variants: {
      variant: {
        default: 'cn-gradient-border--badge-default text-ink',
        secondary: 'cn-gradient-border--badge-secondary text-on-secondary',
        destructive: 'cn-gradient-border--badge-destructive text-white',
        outline: 'cn-gradient-border--card text-ink',
      },
      size: {
        default: 'gap-1.5 px-2.5 py-1 text-sm tracking-label-sm [&_svg]:size-3',
        sm: 'gap-1 px-2 py-1 text-xs tracking-label-xs font-light [&_svg]:size-2.5',
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
