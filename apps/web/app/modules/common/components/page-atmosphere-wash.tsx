import { cn } from '@repo/ui'

type PageAtmosphereWashProps = {
  className?: string
}

/** Soft primary wash behind page headers. Parent must be `relative`. */
export function PageAtmosphereWash({ className }: PageAtmosphereWashProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute -inset-x-6 -top-9 h-36 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--color-primary)_14%,transparent),transparent_70%)] sm:-inset-x-10',
        className
      )}
    />
  )
}
