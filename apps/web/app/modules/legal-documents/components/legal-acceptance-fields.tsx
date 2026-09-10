import type { PublicLegalDocumentResponse } from '@repo/types'
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  RICH_EDITOR_HTML_CLASS_NAME,
  cn,
  richEditorJsonToHtml,
} from '@repo/ui'

export function PublishedLegalDocumentDialog({
  document,
  closeLabel,
  description,
  onClose,
}: {
  document: PublicLegalDocumentResponse | null
  closeLabel: string
  description: string
  onClose: () => void
}) {
  const html = document ? richEditorJsonToHtml(document.content) : ''

  return (
    <Dialog
      open={document !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent
        size="lg"
        closeLabel={closeLabel}
        className="flex max-h-[min(90vh,40rem)] flex-col overflow-hidden"
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{document?.title ?? ''}</DialogTitle>
          <DialogDescription className="sr-only">{description}</DialogDescription>
        </DialogHeader>
        <div
          className={cn('min-h-0 overflow-y-auto', RICH_EDITOR_HTML_CLASS_NAME)}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </DialogContent>
    </Dialog>
  )
}

export function LegalAcceptanceField({
  id,
  label,
  openLabel,
  checked,
  invalid,
  describedBy,
  onCheckedChange,
  onOpen,
}: {
  id: string
  label: string
  openLabel: string
  checked: boolean
  invalid: boolean
  describedBy?: string
  onCheckedChange: (checked: boolean) => void
  onOpen: () => void
}) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox
        id={id}
        checked={checked}
        className="shrink-0"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
        <label htmlFor={id} className="cursor-pointer py-2 text-sm leading-snug text-on-surface">
          {label}
        </label>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto min-w-0 whitespace-normal px-0 py-2 text-left leading-snug text-on-surface underline"
          onClick={onOpen}
        >
          {openLabel}
        </Button>
      </div>
    </div>
  )
}
