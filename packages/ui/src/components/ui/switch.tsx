import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '../../lib/utils'

const switchTrackClassName =
  'peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent p-0.5 transition-[background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:border-outline-variant/60 data-[state=unchecked]:bg-surface-container-low data-[state=checked]:border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:shadow-(--shadow-primary-glow) motion-reduce:transition-none'

const switchThumbClassName =
  'pointer-events-none block size-5 rounded-full shadow-md ring-0 transition-[transform,background-color] data-[state=unchecked]:translate-x-0 data-[state=unchecked]:bg-on-surface-variant data-[state=checked]:translate-x-5 data-[state=checked]:bg-primary-foreground motion-reduce:transition-none'

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root ref={ref} className={cn(switchTrackClassName, className)} {...props}>
    <SwitchPrimitive.Thumb className={switchThumbClassName} />
  </SwitchPrimitive.Root>
))
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }
