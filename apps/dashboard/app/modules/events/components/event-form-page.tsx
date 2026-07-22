import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import type { EventResponse } from '@afterdark/types'
import { parseEventFormToCreateInput, parseEventFormToUpdateInput } from '@afterdark/validators'
import { Button, toast } from '@afterdark/ui'
import { FormPageActions } from '~/modules/common/components/form-page-actions'
import { EventUnsavedChangesDialog } from '~/modules/events/components/event-unsaved-changes-dialog'
import { EventFormPageLayout } from '~/modules/events/components/event-form-page-layout'
import { EventFormErrorAlert } from '~/modules/events/components/event-form-error-alert'
import { EventLocationField } from '~/modules/events/components/event-location-field'
import {
  EventDetailsForm,
  type EventDetailsFormHandle,
  type EventDetailsValues,
} from '~/modules/events/components/event-details-form'
import { useCreateEvent, useUpdateEvent } from '~/modules/events/mutation/use-event-mutations'
import {
  EMPTY_EVENT_FORM_VALUES,
  eventResponseToFormValues,
} from '~/modules/events/utils/event-form.mapper'
import { useLocations } from '~/modules/locations/queries/use-locations-queries'
import {
  readLastEventLocationId,
  saveLastEventLocationId,
} from '~/modules/events/utils/last-location.storage'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import { EVENT_FORM_MODE, type EventFormMode } from '~/modules/events/utils/event-form.types'

type EventFormPageProps = {
  mode: EventFormMode
  title: string
  description: string
  event?: EventResponse
}

function buildDetailsDefaults(event?: EventResponse): EventDetailsValues {
  const fields = event ? eventResponseToFormValues(event) : EMPTY_EVENT_FORM_VALUES

  return {
    name: fields.name,
    description: fields.description,
    startsAt: fields.startsAt,
    endsAt: fields.endsAt,
    status: fields.status,
    existingImages: event?.images ?? [],
    eventImg: [],
  }
}

export function EventFormPage({ mode, title, description, event }: EventFormPageProps) {
  const { t } = useTranslation('events')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const isCreate = mode === EVENT_FORM_MODE.CREATE

  const [locationId, setLocationId] = useState(event?.locationId ?? '')
  const [detailsValues] = useState<EventDetailsValues>(() => buildDetailsDefaults(event))
  const [locationDirty, setLocationDirty] = useState(false)
  const [detailsDirty, setDetailsDirty] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [unsavedOpen, setUnsavedOpen] = useState(false)
  const [lastUsedLocationId, setLastUsedLocationId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const detailsFormRef = useRef<EventDetailsFormHandle | null>(null)
  const appliedLastLocationRef = useRef(false)
  const keyboardActionRef = useRef<() => void>(() => {})
  const leaveActionRef = useRef<() => void>(() => {
    navigate({ to: DASHBOARD_ROUTES.events() })
  })

  const createEventMutation = useCreateEvent()
  const updateEventMutation = useUpdateEvent()

  const {
    data: locations = [],
    isLoading: isLocationsLoading,
    isError: isLocationsError,
  } = useLocations()

  const initialLocationId = event?.locationId ?? ''
  const anyDirty = locationDirty || detailsDirty
  const canSubmit = locations.length > 0 && locationId.length > 0

  const goToList = useCallback(() => {
    navigate({ to: DASHBOARD_ROUTES.events() })
  }, [navigate])

  const requestLeave = useCallback(
    (action: () => void) => {
      leaveActionRef.current = action
      if (anyDirty) {
        setUnsavedOpen(true)
        return
      }
      action()
    },
    [anyDirty]
  )

  useEffect(() => {
    if (!anyDirty) return

    const handleBeforeUnload = (browserEvent: BeforeUnloadEvent) => {
      browserEvent.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [anyDirty])

  useEffect(() => {
    if (!isCreate) return
    setLastUsedLocationId(readLastEventLocationId())
  }, [isCreate])

  useEffect(() => {
    if (!isCreate || appliedLastLocationRef.current) return
    if (locationId) return
    if (!lastUsedLocationId || !locations.some((l) => l.documentId === lastUsedLocationId)) return

    appliedLastLocationRef.current = true
    setLocationId(lastUsedLocationId)
  }, [isCreate, locationId, lastUsedLocationId, locations])

  const handleLocationIdChange = (nextLocationId: string) => {
    setLocationId(nextLocationId)
    setLocationDirty(nextLocationId !== initialLocationId)
    setSubmitError(null)
  }

  const handleDetailsDirty = (dirty: boolean) => {
    setDetailsDirty(dirty)
  }

  const handleSubmit = async () => {
    if (!locationId) {
      setSubmitError(t('form.locationRequiredError'))
      return
    }

    const detailsValid = await detailsFormRef.current?.validate()
    if (!detailsValid) return

    const captured = detailsFormRef.current?.getValues()
    if (!captured) return

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const formFields = { ...captured.details, locationId }

      if (isCreate) {
        await createEventMutation.mutateAsync({
          input: parseEventFormToCreateInput(formFields),
          images: captured.newImages,
        })
        saveLastEventLocationId(locationId)
        toast.success(t('form.successCreate'))
      } else {
        if (!event) return
        await updateEventMutation.mutateAsync({
          documentId: event.documentId,
          input: parseEventFormToUpdateInput(formFields),
          keepImageIds: captured.existingImages.map((image) => image.documentId),
          newImages: captured.newImages,
        })
        toast.success(t('form.successEdit'))
      }

      setLocationDirty(false)
      setDetailsDirty(false)

      if (isCreate) {
        navigate({ to: DASHBOARD_ROUTES.ticketsNew() })
      } else {
        goToList()
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : isCreate
            ? t('form.errorCreate')
            : t('form.errorEdit')
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    keyboardActionRef.current = () => {
      if (unsavedOpen || isSubmitting || !canSubmit || !anyDirty) return
      void handleSubmit()
    }
  })

  useEffect(() => {
    const handleKeyDown = (browserEvent: KeyboardEvent) => {
      if ((browserEvent.metaKey || browserEvent.ctrlKey) && browserEvent.key === 'Enter') {
        browserEvent.preventDefault()
        keyboardActionRef.current()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const footer = (
    <FormPageActions
      isDirty={anyDirty}
      isSaving={isSubmitting}
      dirtyLabel={tCommon('formActions.dirty')}
      cleanLabel={tCommon('formActions.clean')}
      cancelLabel={t('form.cancel')}
      onCancel={() => requestLeave(goToList)}
      cancelDisabled={isSubmitting}
    >
      <Button
        type="button"
        variant={anyDirty ? 'default' : 'outline'}
        className="w-full sm:w-auto"
        loading={isSubmitting}
        disabled={!canSubmit || isSubmitting || !anyDirty}
        onClick={() => {
          void handleSubmit()
        }}
      >
        {isCreate ? t('form.submitCreate') : t('form.submitEdit')}
      </Button>
    </FormPageActions>
  )

  return (
    <>
      <EventFormPageLayout
        title={title}
        description={description}
        onBack={() => requestLeave(goToList)}
        footer={footer}
        footerBanner={
          submitError ? (
            <EventFormErrorAlert title={t('form.submitErrorTitle')} message={submitError} />
          ) : null
        }
      >
        <div className="flex flex-col gap-12">
          <EventLocationField
            locations={locations}
            isLoading={isLocationsLoading}
            isError={isLocationsError}
            locationId={locationId}
            lastUsedLocationId={lastUsedLocationId}
            onLocationIdChange={handleLocationIdChange}
          />
          <EventDetailsForm
            ref={detailsFormRef}
            defaultValues={detailsValues}
            onDirtyChange={handleDetailsDirty}
          />
        </div>
      </EventFormPageLayout>

      <EventUnsavedChangesDialog
        open={unsavedOpen}
        onOpenChange={setUnsavedOpen}
        onConfirmLeave={() => leaveActionRef.current()}
      />
    </>
  )
}
