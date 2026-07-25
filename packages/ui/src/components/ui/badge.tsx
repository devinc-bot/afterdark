import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

/**
 * Soft-depth status chips — tonal fills, no gradient-border costume.
 * Matches the product chip ramp: ink fill, muted wash, soft error, hairline outline.
 */
const badgeVariants = cva(
  [
    'inline-flex w-fit max-w-full shrink-0 items-center justify-center rounded-pill border border-transparent',
    'font-label leading-none whitespace-nowrap',
    'transition-[color,background-color,border-color,box-shadow,opacity] duration-(--duration-instant) ease-emphasized',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    'motion-reduce:transition-none',
  ],
  {
    variants: {
      variant: {
        // Filled ink pill (black↔white by theme)
        default: 'bg-ink text-background',
        // Soft gray wash
        secondary: 'bg-secondary-container text-on-surface',
        // Soft red wash + error label
        destructive: 'bg-error/15 text-error',
        // Hairline edge, raised surface
        outline: 'border-hairline bg-surface-card text-ink',
      },
      size: {
        default: 'gap-1.5 px-3 py-1 text-xs font-medium tracking-label-sm [&_svg]:size-3',
        sm: 'gap-1 px-3 py-1 text-xs font-semibold tracking-label-xs [&_svg]:size-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
    icon?: React.ReactNode
  }

function Badge({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  icon,
  children,
  ...props
}: BadgeProps) {
  const classes = cn(badgeVariants({ variant, size }), className)

  if (asChild) {
    return (
      <Slot data-slot="badge" data-variant={variant} className={classes} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <span data-slot="badge" data-variant={variant} className={classes} {...props}>
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
