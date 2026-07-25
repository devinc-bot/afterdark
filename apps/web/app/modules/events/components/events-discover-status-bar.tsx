import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Button, cn } from '@repo/ui'
import {
  formatDiscoverFilterDate,
  type EventsDiscoverFilterField,
  type EventsDiscoverFiltersValue,
} from '../utils/events-discover-filters'

type Chip = {
  field: EventsDiscoverFilterField
  label: string
}

type EventsDiscoverStatusBarProps = {
  appliedFilters: EventsDiscoverFiltersValue
  total: number | null
  isDirty: boolean
  onRemoveFilter: (field: EventsDiscoverFilterField) => void
  onClearAll: () => void
  className?: string
}

export function EventsDiscoverStatusBar({
  appliedFilters,
  total,
  isDirty,
  onRemoveFilter,
  onClearAll,
  className,
}: EventsDiscoverStatusBarProps) {
  const { t } = useTranslation('events')

  const chips: Chip[] = []
  if (appliedFilters.startsFrom) {
    chips.push({
      field: 'startsFrom',
      label: t('discover.filters.chipFrom', {
        date: formatDiscoverFilterDate(appliedFilters.startsFrom),
      }),
    })
  }
  if (appliedFilters.startsTo) {
    chips.push({
      field: 'startsTo',
      label: t('discover.filters.chipTo', {
        date: formatDiscoverFilterDate(appliedFilters.startsTo),
      }),
    })
  }
  if (appliedFilters.city.trim()) {
    chips.push({
      field: 'city',
      label: t('discover.filters.chipCity', { city: appliedFilters.city.trim() }),
    })
  }
  if (appliedFilters.state.trim()) {
    chips.push({
      field: 'state',
      label: t('discover.filters.chipState', { state: appliedFilters.state.trim() }),
    })
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {total !== null ? (
            <p className="font-label text-sm text-on-surface" aria-live="polite">
              {t('discover.list.resultsCount', { count: total })}
            </p>
          ) : null}
          <p className="font-label text-xs text-on-surface-variant">
            {t('discover.list.sortHint')}
          </p>
        </div>
        {isDirty ? (
          <p className="font-label text-xs text-primary">{t('discover.filters.pendingChanges')}</p>
        ) : null}
      </div>

      {chips.length > 0 ? (
        <div
          className="flex flex-wrap items-center gap-2"
          aria-label={t('discover.filters.appliedAria')}
        >
          {chips.map((chip) => (
            <div
              key={chip.field}
              className="inline-flex px-5 items-center gap-1.5 rounded-full border border-hairline/60 bg-surface-container-low py-1.5 font-label text-xs text-on-surface transition-colors hover:bg-on-surface/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter(chip.field)}
                className="opacity-70 cursor-pointer hover:opacity-100 rounded-full hover:text-primary hover:bg-background p-1"
              >
                <X className="size-3.5" aria-hidden />
                <span className="sr-only">
                  {t('discover.filters.removeChip', { label: chip.label })}
                </span>
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            className="h-9 font-label text-xs text-on-surface-variant"
            onClick={onClearAll}
          >
            {t('discover.filters.clear')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
