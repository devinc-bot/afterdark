import type { ReactNode } from 'react'
import { Button, cn } from '@repo/ui'

type FormPageActionsProps = {
  isDirty: boolean
  isSaving: boolean
  dirtyLabel: string
  cleanLabel: string
  cancelLabel: string
  onCancel: () => void
  /** Defaults to disabled when clean or saving (settings discard). */
  cancelDisabled?: boolean
  /** Adds top border — use for inline footers (settings). Fixed bars already have a border. */
  withBorder?: boolean
  children: ReactNode
}

export function FormPageActions({
  isDirty,
  isSaving,
  dirtyLabel,
  cleanLabel,
  cancelLabel,
  onCancel,
  cancelDisabled,
  withBorder = false,
  children,
}: FormPageActionsProps) {
  const isCancelDisabled = cancelDisabled ?? (!isDirty || isSaving)

  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between',
        withBorder && 'border-t border-hairline/60 pt-6'
      )}
    >
      <p
        className={cn(
          'flex items-center gap-2 text-sm transition-colors duration-(--duration-fast)',
          isDirty ? 'text-ink' : 'text-ink-muted'
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'size-1.5 shrink-0 rounded-full transition-[background-color,opacity,transform] duration-(--duration-fast) ease-emphasized',
            isDirty
              ? 'scale-100 bg-primary opacity-100 motion-safe:animate-pulse'
              : 'scale-75 bg-ink-muted/40 opacity-60'
          )}
        />
        {isDirty ? dirtyLabel : cleanLabel}
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          className="w-full sm:w-auto"
          disabled={isCancelDisabled}
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
        {children}
      </div>
    </div>
  )
}
