import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-xl font-sans text-[15px] font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        outline:
          'border border-hairline-strong bg-surface-card text-ink shadow-sm hover:bg-surface-strong',
        gradient:
          'cn-gradient-border cn-gradient-border--field text-ink shadow-sm transition-[box-shadow] hover:opacity-90 focus-visible:ring-primary/25 disabled:opacity-60 motion-reduce:transition-none',
        inverse: 'border border-white/20 bg-surface-card text-ink shadow-sm hover:bg-white',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-surface-strong hover:text-ink',
        link: 'text-ink underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 [&_svg]:size-[16px]',
        sm: 'h-9 px-4 text-[13px] [&_svg]:size-[14px]',
        lg: 'h-11 px-8 [&_svg]:size-[18px]',
        icon: 'h-10 w-10 [&_svg]:size-[20px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const spinnerSizeClasses: Record<
  NonNullable<VariantProps<typeof buttonVariants>['size']>,
  string
> = {
  sm: '!size-5',
  default: '!size-7',
  lg: '!size-8',
  icon: '!size-7',
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      iconLeft,
      iconRight,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    const isDisabled = disabled || loading

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? (
              <Loader2
                className={cn('animate-spin', spinnerSizeClasses[size ?? 'default'])}
                aria-hidden="true"
              />
            ) : (
              iconLeft
            )}
            {children}
            {!loading && iconRight}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
