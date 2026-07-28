import { Ticket } from 'lucide-react'
import { Button, cn } from '@repo/ui'

type EventDetailBuyButtonProps = {
  label: string
  disabled?: boolean
  title?: string
  className?: string
}

export function EventDetailBuyButton({
  label,
  disabled = false,
  title,
  className,
}: EventDetailBuyButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant={disabled ? 'outline' : 'default'}
      disabled={disabled}
      title={title}
      aria-label={title ?? label}
      aria-disabled={disabled || undefined}
      iconLeft={<Ticket aria-hidden strokeWidth={1.75} />}
      className={cn(
        'shrink-0 rounded-full',
        disabled && 'border-hairline/60 bg-surface-muted text-on-surface-variant',
        className
      )}
    >
      {label}
    </Button>
  )
}
