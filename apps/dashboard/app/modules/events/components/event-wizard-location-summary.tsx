import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import { Badge, Button, cn } from '@afterdark/ui'

type EventWizardLocationSummaryProps = {
  name: string
  isNew: boolean
  onChange: () => void
  disabled?: boolean
  className?: string
}

export function EventWizardLocationSummary({
  name,
  isNew,
  onChange,
  disabled,
  className,
}: EventWizardLocationSummaryProps) {
  const { t } = useTranslation('events')
  const displayName = name || t('wizard.locationSummaryFallback')

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-xl border border-hairline bg-surface-container-low px-4 py-3',
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <MapPin aria-hidden="true" className="size-4 shrink-0 text-ink-muted" />
        <div className="flex min-w-0 flex-col gap-0.5 leading-tight">
          <span className="text-sm font-medium text-ink-muted-soft">
            {t('wizard.locationSummaryLabel')}
          </span>
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate font-heading text-base font-medium text-ink">
              {displayName}
            </span>
            {isNew ? (
              <Badge variant="outline" size="sm" className="shrink-0">
                {t('wizard.locationSummaryNew')}
              </Badge>
            ) : null}
          </span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0"
        disabled={disabled}
        onClick={onChange}
        aria-label={t('wizard.locationSummaryChangeAria')}
      >
        {t('wizard.locationSummaryChange')}
      </Button>
    </div>
  )
}
