import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { Card } from './card'

const kpiInformationVariants = cva('', {
  variants: {
    variant: {
      default: '',
      primary: '',
      warning: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const labelVariants = cva('text-base leading-snug', {
  variants: {
    variant: {
      default: 'text-ink-muted',
      primary: 'text-ink-muted',
      warning: 'text-primary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const valueVariants = cva('font-heading text-3xl font-bold leading-none tracking-tight', {
  variants: {
    variant: {
      default: 'text-ink',
      primary: 'text-primary',
      warning: 'text-primary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const iconContainerVariants = cva(
  'flex size-12 shrink-0 items-center justify-center rounded-lg [&_svg]:size-5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-surface-container-high text-ink',
        primary: 'bg-surface-container-high text-primary',
        warning: 'bg-error-container/30 text-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface KpiInformationProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof kpiInformationVariants> {
  label: string
  value: React.ReactNode
  subtext?: React.ReactNode
  icon?: React.ReactNode
}

const KpiInformation = React.forwardRef<HTMLDivElement, KpiInformationProps>(
  ({ className, variant, label, value, subtext, icon, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        variant="gradient"
        className={cn('p-6', kpiInformationVariants({ variant }), className)}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <p className={cn(labelVariants({ variant }))}>{label}</p>
            <p className={cn(valueVariants({ variant }))}>{value}</p>
            {subtext ? (
              <div className="flex items-center gap-1 text-sm text-ink-muted [&_svg]:size-3.5 [&_svg]:shrink-0">
                {subtext}
              </div>
            ) : null}
          </div>
          {icon ? <div className={cn(iconContainerVariants({ variant }))}>{icon}</div> : null}
        </div>
      </Card>
    )
  }
)
KpiInformation.displayName = 'KpiInformation'

export { KpiInformation, kpiInformationVariants }
