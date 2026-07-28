import { Link, type LinkProps } from './link'
import { cn } from '../../lib/utils'

export type NotFoundViewProps = {
  brandLabel: string
  title: string
  description: string
  actionLabel: string
  /** Router path for the primary escape action. */
  actionTo: LinkProps['to']
  className?: string
}

/** Full-viewport / inline not-found surface (dashboard chrome). */
export function NotFoundView({
  brandLabel,
  title,
  description,
  actionLabel,
  actionTo,
  className,
}: NotFoundViewProps) {
  return (
    <div
      className={cn(
        'flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center',
        className
      )}
    >
      <p className="font-mono text-xs font-semibold tracking-widest text-ink-muted uppercase">
        {brandLabel}
      </p>
      <div className="mt-6 max-w-sm space-y-2">
        <p className="font-heading text-xl font-semibold text-ink">{title}</p>
        <p className="text-sm text-ink-muted">{description}</p>
      </div>
      <div className="mt-8">
        <Link to={actionTo} variant="button">
          {actionLabel}
        </Link>
      </div>
    </div>
  )
}
