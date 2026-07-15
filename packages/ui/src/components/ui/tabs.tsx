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
        line: 'h-auto w-fit justify-start gap-4 rounded-none border-b border-outline-variant bg-transparent p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const tabsTriggerVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap font-medium',
    'transition-colors duration-(--duration-fast) ease-(--ease-emphasized)',
    'focus-visible:outline-none',
    'disabled:pointer-events-none disabled:opacity-50',
    'motion-reduce:transition-none',
  ],
  {
    variants: {
      variant: {
        default: [
          'rounded-sm px-3 py-1.5 text-sm',
          'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        ],
        line: [
          'relative rounded-none py-4 font-label text-xs font-semibold uppercase tracking-label-xs text-on-surface-variant',
          'after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-primary after:content-[""]',
          'after:transition-transform after:duration-(--duration-fast) after:ease-[cubic-bezier(0.22,1,0.36,1)]',
          'data-[state=active]:text-primary data-[state=active]:after:scale-x-100',
          'data-[state=inactive]:hover:text-on-surface',
          'focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container',
          'motion-reduce:after:transition-none',
        ],
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
      'mt-2 focus-visible:outline-none focus-visible:ring-0',
      'data-[state=inactive]:hidden',
      'data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-(--duration-fast)',
      'motion-reduce:data-[state=active]:animate-none',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants }
