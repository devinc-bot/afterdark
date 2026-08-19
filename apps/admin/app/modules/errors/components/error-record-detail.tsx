import { useTranslation } from 'react-i18next'
import type { ApiErrorRecordResponse } from '@repo/types'
import { Badge, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@repo/ui'
import { formatDate } from '@repo/common'

function DetailField({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string | null
  mono?: boolean
}) {
  const content = value ?? null

  return (
    <div className="flex flex-col gap-1">
      <dt className="font-label text-xs font-semibold tracking-label-xs text-ink-muted uppercase">
        {label}
      </dt>
      <dd className={mono ? 'font-mono text-sm break-words text-ink' : 'text-sm text-ink'}>
        {content ?? '—'}
      </dd>
    </div>
  )
}

export function ErrorRecordDetail({
  record,
  onOpenChange,
}: {
  record: ApiErrorRecordResponse | null
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation('admin')

  return (
    <Sheet open={record !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        overlayClassName="bg-surface-strong/45 backdrop-blur-[2px]"
        closeLabel={t('errors.detail.close')}
        className="inset-y-3 right-3 h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] gap-0 overflow-y-auto rounded-app border border-hairline bg-surface-raised p-6 shadow-glass sm:right-5 sm:w-full sm:max-w-xl"
      >
        {record ? (
          <>
            <SheetHeader className="border-b border-hairline pb-4">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{record.statusCode}</Badge>
                <Badge variant="outline">{record.method}</Badge>
              </div>
              <SheetTitle className="text-left">{record.errorName}</SheetTitle>
              <SheetDescription className="text-left font-mono text-xs break-all">
                {record.path}
              </SheetDescription>
            </SheetHeader>

            <dl className="flex flex-col gap-5 py-4">
              <DetailField
                label={t('errors.detail.occurredAt')}
                value={formatDate(record.createdAt, {
                  options: { dateStyle: 'medium', timeStyle: 'medium' },
                })}
              />
              <DetailField label={t('errors.detail.message')} value={record.message} />
              <DetailField
                label={t('errors.detail.correlationId')}
                value={record.correlationId}
                mono
              />
              <DetailField label={t('errors.detail.fingerprint')} value={record.fingerprint} mono />
              <DetailField label={t('errors.detail.stack')} value={record.stack} mono />
            </dl>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
