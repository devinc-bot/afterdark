import { cn } from '../../lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-surface-container motion-reduce:animate-none',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
