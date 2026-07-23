import { useTranslation } from 'react-i18next'
import { Button, DateInput, Field, Input } from '@afterdark/ui'
import type { EventsDiscoverFiltersValue } from '../utils/events-discover-filters'

type EventsDiscoverFiltersPanelProps = {
  value: EventsDiscoverFiltersValue
  onChange: (next: EventsDiscoverFiltersValue) => void
  onApply: () => void
  onClear: () => void
  dateRangeError?: string | null
  /** Prefix form control ids when the panel can mount twice (desktop + sheet). */
  idPrefix?: string
  showHeading?: boolean
  /** True when draft filters differ from applied filters. */
  isDirty?: boolean
  /** Show the pending-changes hint above Aplicar (hide on desktop when status bar owns it). */
  showPendingHint?: boolean
}

export function EventsDiscoverFiltersPanel({
  value,
  onChange,
  onApply,
  onClear,
  dateRangeError = null,
  idPrefix = 'events-filter',
  showHeading = true,
  isDirty = false,
  showPendingHint = true,
}: EventsDiscoverFiltersPanelProps) {
  const { t } = useTranslation('events')
  const startsFromId = `${idPrefix}-starts-from`
  const startsToId = `${idPrefix}-starts-to`
  const cityId = `${idPrefix}-city`
  const stateId = `${idPrefix}-state`

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
    >
      {showHeading ? (
        <h2 className="font-display text-lg font-semibold tracking-tight text-on-surface">
          {t('discover.filters.title')}
        </h2>
      ) : null}

      <Field label={t('discover.filters.startsFrom')} htmlFor={startsFromId}>
        <DateInput
          id={startsFromId}
          name="startsFrom"
          value={value.startsFrom}
          onChange={(event) => onChange({ ...value, startsFrom: event.target.value })}
        />
      </Field>

      <Field label={t('discover.filters.startsTo')} htmlFor={startsToId} error={dateRangeError}>
        <DateInput
          id={startsToId}
          name="startsTo"
          value={value.startsTo}
          onChange={(event) => onChange({ ...value, startsTo: event.target.value })}
          aria-invalid={dateRangeError ? true : undefined}
        />
      </Field>

      <Field label={t('discover.filters.city')} htmlFor={cityId}>
        <Input
          id={cityId}
          name="city"
          value={value.city}
          placeholder={t('discover.filters.cityPlaceholder')}
          onChange={(event) => onChange({ ...value, city: event.target.value })}
          autoComplete="address-level2"
        />
      </Field>

      <Field label={t('discover.filters.state')} htmlFor={stateId}>
        <Input
          id={stateId}
          name="state"
          value={value.state}
          placeholder={t('discover.filters.statePlaceholder')}
          onChange={(event) => onChange({ ...value, state: event.target.value })}
          autoComplete="address-level1"
        />
      </Field>

      <div className="flex flex-col gap-2 pt-1">
        {showPendingHint && isDirty ? (
          <p className="font-label text-xs text-primary">{t('discover.filters.pendingChanges')}</p>
        ) : null}
        <Button type="submit" className="min-h-11 w-full" disabled={!isDirty}>
          {t('discover.filters.apply')}
        </Button>
        <Button type="button" variant="outline" className="min-h-11 w-full" onClick={onClear}>
          {t('discover.filters.clear')}
        </Button>
      </div>
    </form>
  )
}
