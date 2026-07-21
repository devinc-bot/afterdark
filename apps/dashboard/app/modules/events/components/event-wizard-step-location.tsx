import { useTranslation } from 'react-i18next'
import { Clock } from 'lucide-react'
import { SelectField, SelectItem, Tabs, TabsContent, TabsList, TabsTrigger } from '@afterdark/ui'
import { useLocations } from '~/modules/locations/queries/use-locations-queries'
import {
  EventWizardNewLocationForm,
  type EventWizardNewLocationFormHandle,
} from '~/modules/events/components/event-wizard-new-location-form'
import type { LocationFormValues } from '~/modules/locations/components/location-form'
import {
  EVENT_LOCATION_MODE,
  type EventLocationMode,
} from '~/modules/events/utils/event-wizard.types'

type EventWizardStepLocationProps = {
  locationMode: EventLocationMode
  locationId: string
  lastUsedLocationId?: string | null
  newLocationFormRef: React.RefObject<EventWizardNewLocationFormHandle | null>
  newLocationDefaults: LocationFormValues
  onLocationModeChange: (mode: EventLocationMode) => void
  onLocationIdChange: (locationId: string) => void
  onNewLocationDirtyChange: (isDirty: boolean) => void
}

export function EventWizardStepLocation({
  locationMode,
  locationId,
  lastUsedLocationId,
  newLocationFormRef,
  newLocationDefaults,
  onLocationModeChange,
  onLocationIdChange,
  onNewLocationDirtyChange,
}: EventWizardStepLocationProps) {
  const { t } = useTranslation('events')
  const {
    data: locations = [],
    isLoading: isLocationsLoading,
    isError: isLocationsError,
  } = useLocations()

  const locationPlaceholder = isLocationsLoading
    ? t('form.locationLoading')
    : isLocationsError
      ? t('form.locationPlaceholder')
      : locations.length === 0
        ? t('form.locationEmpty')
        : t('form.locationPlaceholder')

  return (
    <section className="flex flex-col gap-6" aria-labelledby="event-wizard-step-location">
      <div className="flex flex-col gap-1 border-b border-hairline pb-3">
        <h2 id="event-wizard-step-location" className="font-heading text-sm font-semibold text-ink">
          {t('wizard.stepLocationTitle')}
        </h2>
        <p className="text-sm text-ink-muted">{t('wizard.stepLocationDescription')}</p>
      </div>

      <Tabs
        value={locationMode}
        onValueChange={(value) => onLocationModeChange(value as EventLocationMode)}
      >
        <TabsList variant="line" className="mb-6">
          <TabsTrigger variant="line" value={EVENT_LOCATION_MODE.EXISTING}>
            {t('wizard.useExistingLocation')}
          </TabsTrigger>
          <TabsTrigger variant="line" value={EVENT_LOCATION_MODE.NEW}>
            {t('wizard.addDifferentLocation')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={EVENT_LOCATION_MODE.EXISTING} className="mt-0">
          <div className="flex flex-col gap-2">
            <SelectField
              label={`${t('form.location')} *`}
              value={locationId || undefined}
              onValueChange={onLocationIdChange}
              placeholder={locationPlaceholder}
              error={isLocationsError ? t('form.locationsLoadError') : undefined}
              disabled={isLocationsLoading || locations.length === 0}
            >
              {locations.map((location) => (
                <SelectItem key={location.documentId} value={location.documentId}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectField>
            {!isLocationsError && locationId && locationId === lastUsedLocationId ? (
              <p className="flex items-center gap-1.5 text-sm text-ink-muted-soft">
                <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                {t('wizard.lastLocationHint')}
              </p>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value={EVENT_LOCATION_MODE.NEW} className="mt-0">
          <EventWizardNewLocationForm
            ref={newLocationFormRef}
            defaultValues={newLocationDefaults}
            onDirtyChange={onNewLocationDirtyChange}
          />
        </TabsContent>
      </Tabs>
    </section>
  )
}
