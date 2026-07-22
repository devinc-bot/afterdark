import { Link as RouterLink, type LinkProps as RouterLinkProps } from '@tanstack/react-router'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const linkVariants = cva(
  [
    'inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-control font-sans text-[15px] font-medium leading-none',
    'transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-(--duration-instant) ease-(--ease-emphasized)',
    'active:scale-[0.98]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
    'disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100',
    'motion-reduce:transition-none motion-reduce:active:scale-100',
  ],
  {
    variants: {
      variant: {
        default: '',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        outline:
          'border border-hairline-strong bg-surface-card text-ink shadow-sm hover:bg-surface-strong',
        gradient:
          'cn-gradient-border cn-gradient-border--field text-ink shadow-sm hover:opacity-90 focus-visible:ring-primary/25 disabled:opacity-60',
        inverse: 'border border-white/20 bg-surface-card text-ink shadow-sm hover:bg-white',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-surface-strong hover:text-ink',
        link: 'text-ink underline-offset-4 hover:underline active:scale-100',
        button: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
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

export interface LinkProps extends RouterLinkProps, VariantProps<typeof linkVariants> {
  className?: string
  size?: VariantProps<typeof linkVariants>['size']
}

export function Link({ className, variant, size, ...props }: LinkProps) {
  return (
    <RouterLink
      className={cn(linkVariants({ variant, size }), 'no-underline', className)}
      {...props}
    />
  )
}
