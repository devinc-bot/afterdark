import { cn } from '@afterdark/ui'

type PageAtmosphereWashProps = {
  className?: string
}

/** Soft primary wash behind page headers. Parent must be `relative`. */
export function PageAtmosphereWash({ className }: PageAtmosphereWashProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute -inset-x-6 -top-8 h-36 bg-[radial-gradient(ellipse_at_top,oklch(0.72_0.08_320/0.06),transparent_70%)] sm:-inset-x-10',
        className
      )}
    />
  )
}
