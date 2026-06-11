import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const Tabs = TabsPrimitive.Root

const tabsListVariants = cva(
  'inline-flex w-fit items-center justify-center text-muted-foreground',
  {
    variants: {
      variant: {
        default: 'h-10 rounded-lg bg-muted p-1',
        line: 'h-auto w-full justify-stretch rounded-none border-b border-outline-variant bg-transparent p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const tabsTriggerVariants = cva(
  'inline-flex flex-1 items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'rounded-sm px-3 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        line: 'relative rounded-none border-b-2 border-transparent py-4 font-label text-xs font-semibold uppercase tracking-label-xs text-on-surface-variant data-[state=active]:border-b-primary data-[state=active]:text-primary data-[state=inactive]:hover:text-on-surface focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface TabsListProps
  extends
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<React.ComponentRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, variant, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
)
TabsList.displayName = TabsPrimitive.List.displayName

export interface TabsTriggerProps
  extends
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant }), className)}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 focus-visible:outline-none focus-visible:ring-0 data-[state=inactive]:hidden',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants }
