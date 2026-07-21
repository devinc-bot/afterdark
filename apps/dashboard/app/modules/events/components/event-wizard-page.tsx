import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import type { EventResponse } from '@afterdark/types'
import { parseEventFormToCreateInput, parseEventFormToUpdateInput } from '@afterdark/validators'
import { Button, toast } from '@afterdark/ui'
import { EventUnsavedChangesDialog } from '~/modules/events/components/event-unsaved-changes-dialog'
import { EventWizardPageLayout } from '~/modules/events/components/event-wizard-page-layout'
import { EventWizardStepper } from '~/modules/events/components/event-wizard-stepper'
import { EventWizardErrorAlert } from '~/modules/events/components/event-wizard-error-alert'
import { EventWizardLocationSummary } from '~/modules/events/components/event-wizard-location-summary'
import { EventWizardShortcutHint } from '~/modules/events/components/event-wizard-shortcut-hint'
import { EventWizardStepLocation } from '~/modules/events/components/event-wizard-step-location'
import {
  EventWizardStepDetails,
  type EventWizardDetailsFormHandle,
  type EventWizardDetailsValues,
} from '~/modules/events/components/event-wizard-step-details'
import type { EventWizardNewLocationFormHandle } from '~/modules/events/components/event-wizard-new-location-form'
import { useCreateEvent, useUpdateEvent } from '~/modules/events/mutation/use-event-mutations'
import {
  EMPTY_EVENT_FORM_VALUES,
  eventResponseToFormValues,
} from '~/modules/events/utils/event-form.mapper'
import { useCreateLocation } from '~/modules/locations/mutation/use-locations-mutations'
import { useLocations } from '~/modules/locations/queries/use-locations-queries'
import {
  readLastEventLocationId,
  saveLastEventLocationId,
} from '~/modules/events/utils/last-location.storage'
import {
  EMPTY_LOCATION_FORM_VALUES,
  type LocationFormValues,
} from '~/modules/locations/components/location-form'
import { buildCreateLocationFormData } from '~/modules/locations/utils/location-form.formatter'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import {
  EVENT_LOCATION_MODE,
  EVENT_WIZARD_MODE,
  EVENT_WIZARD_STEP,
  type EventLocationMode,
  type EventWizardMode,
  type EventWizardStep,
} from '~/modules/events/utils/event-wizard.types'

type EventWizardPageProps = {
  mode: EventWizardMode
  title: string
  description: string
  event?: EventResponse
}

function buildDetailsDefaults(event?: EventResponse): EventWizardDetailsValues {
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

export function EventWizardPage({ mode, title, description, event }: EventWizardPageProps) {
  const { t } = useTranslation('events')
  const navigate = useNavigate()
  const isCreate = mode === EVENT_WIZARD_MODE.CREATE

  const [step, setStep] = useState<EventWizardStep>(EVENT_WIZARD_STEP.LOCATION)
  const [locationMode, setLocationMode] = useState<EventLocationMode>(EVENT_LOCATION_MODE.EXISTING)
  const [locationId, setLocationId] = useState(event?.locationId ?? '')
  const [newLocationValues, setNewLocationValues] = useState<LocationFormValues>(
    EMPTY_LOCATION_FORM_VALUES
  )
  const [detailsValues, setDetailsValues] = useState<EventWizardDetailsValues>(() =>
    buildDetailsDefaults(event)
  )
  const [isDirty, setIsDirty] = useState(false)
  const [newLocationDirty, setNewLocationDirty] = useState(false)
  const [detailsDirty, setDetailsDirty] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [unsavedOpen, setUnsavedOpen] = useState(false)
  const [lastUsedLocationId, setLastUsedLocationId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const newLocationFormRef = useRef<EventWizardNewLocationFormHandle | null>(null)
  const detailsFormRef = useRef<EventWizardDetailsFormHandle | null>(null)
  const appliedLastLocationRef = useRef(false)
  const keyboardActionRef = useRef<() => void>(() => {})
  const leaveActionRef = useRef<() => void>(() => {
    navigate({ to: DASHBOARD_ROUTES.events() })
  })

  const createEventMutation = useCreateEvent()
  const updateEventMutation = useUpdateEvent()
  const createLocationMutation = useCreateLocation()

  const { data: locations } = useLocations()

  const initialLocationId = event?.locationId ?? ''
  const anyDirty = isDirty || newLocationDirty || detailsDirty

  const isNewLocation = locationMode === EVENT_LOCATION_MODE.NEW
  const selectedLocationName = isNewLocation
    ? newLocationValues.name.trim()
    : (locations?.find((location) => location.documentId === locationId)?.name ?? '')

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
    if (locationMode !== EVENT_LOCATION_MODE.EXISTING || locationId) return
    if (!lastUsedLocationId || !locations?.some((l) => l.documentId === lastUsedLocationId)) return

    appliedLastLocationRef.current = true
    setLocationId(lastUsedLocationId)
  }, [isCreate, locationMode, locationId, lastUsedLocationId, locations])

  const handleLocationModeChange = (nextMode: EventLocationMode) => {
    setLocationMode(nextMode)
    setIsDirty(true)
    if (nextMode === EVENT_LOCATION_MODE.EXISTING) {
      setNewLocationDirty(false)
      setNewLocationValues(EMPTY_LOCATION_FORM_VALUES)
    }
  }

  const handleLocationIdChange = (nextLocationId: string) => {
    setLocationId(nextLocationId)
    setIsDirty(nextLocationId !== initialLocationId || step !== EVENT_WIZARD_STEP.LOCATION)
    setSubmitError(null)
  }

  const handleNewLocationDirty = (dirty: boolean) => {
    if (dirty) setNewLocationDirty(true)
  }

  const handleDetailsDirty = (dirty: boolean) => {
    if (dirty) setDetailsDirty(true)
  }

  const canGoNext = locationMode === EVENT_LOCATION_MODE.EXISTING ? locationId.length > 0 : true

  const handleNext = async () => {
    setSubmitError(null)
    if (locationMode === EVENT_LOCATION_MODE.NEW) {
      const valid = await newLocationFormRef.current?.validate()
      if (!valid) return
      const values = newLocationFormRef.current?.getValues()
      if (values) setNewLocationValues(values)
    } else if (!locationId) {
      return
    }

    setStep(EVENT_WIZARD_STEP.DETAILS)
  }

  const handleBackToLocation = () => {
    setSubmitError(null)
    const captured = detailsFormRef.current?.getValues()
    if (captured) {
      setDetailsValues((current) => ({
        ...current,
        ...captured.details,
        existingImages: captured.existingImages,
        eventImg: captured.newImages,
      }))
    }
    setStep(EVENT_WIZARD_STEP.LOCATION)
  }

  const handleStepSelect = (target: EventWizardStep) => {
    if (target === EVENT_WIZARD_STEP.LOCATION && step === EVENT_WIZARD_STEP.DETAILS) {
      handleBackToLocation()
    }
  }

  const resolveLocationId = async (): Promise<string | null> => {
    if (locationMode === EVENT_LOCATION_MODE.EXISTING) {
      return locationId || null
    }

    const created = await createLocationMutation.mutateAsync(
      buildCreateLocationFormData(newLocationValues)
    )
    return created.documentId
  }

  const handleSubmit = async () => {
    const detailsValid = await detailsFormRef.current?.validate()
    if (!detailsValid) return

    const captured = detailsFormRef.current?.getValues()
    if (!captured) return

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const resolvedLocationId = await resolveLocationId()
      if (!resolvedLocationId) {
        setSubmitError(t('wizard.locationResolveError'))
        setStep(EVENT_WIZARD_STEP.LOCATION)
        return
      }

      const formFields = { ...captured.details, locationId: resolvedLocationId }

      if (isCreate) {
        await createEventMutation.mutateAsync({
          input: parseEventFormToCreateInput(formFields),
          images: captured.newImages,
        })
        saveLastEventLocationId(resolvedLocationId)
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

      setIsDirty(false)
      setNewLocationDirty(false)
      setDetailsDirty(false)
      goToList()
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
      if (unsavedOpen || isSubmitting) return
      if (step === EVENT_WIZARD_STEP.LOCATION) {
        if (canGoNext) void handleNext()
        return
      }
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

  const shortcutLabel =
    step === EVENT_WIZARD_STEP.LOCATION
      ? t('wizard.next')
      : isCreate
        ? t('form.submitCreate')
        : t('form.submitEdit')

  const footer =
    step === EVENT_WIZARD_STEP.LOCATION ? (
      <>
        <EventWizardShortcutHint label={shortcutLabel} className="sm:mr-auto" />
        <Button
          type="button"
          variant="outline"
          size="default"
          className="min-w-36 sm:min-w-40"
          onClick={() => requestLeave(goToList)}
        >
          {t('wizard.cancel')}
        </Button>
        <Button
          type="button"
          size="default"
          className="min-w-36 sm:min-w-40"
          disabled={!canGoNext}
          onClick={() => {
            void handleNext()
          }}
        >
          {t('wizard.next')}
        </Button>
      </>
    ) : (
      <>
        <EventWizardShortcutHint label={shortcutLabel} className="sm:mr-auto" />
        <Button
          type="button"
          variant="outline"
          size="default"
          className="min-w-36 sm:min-w-40"
          disabled={isSubmitting}
          onClick={handleBackToLocation}
        >
          {t('wizard.backStep')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="default"
          className="min-w-36 sm:min-w-40"
          disabled={isSubmitting}
          onClick={() => requestLeave(goToList)}
        >
          {t('wizard.cancel')}
        </Button>
        <Button
          type="button"
          size="default"
          className="min-w-36 sm:min-w-40"
          loading={isSubmitting}
          onClick={() => {
            void handleSubmit()
          }}
        >
          {isCreate ? t('form.submitCreate') : t('form.submitEdit')}
        </Button>
      </>
    )

  return (
    <>
      <EventWizardPageLayout
        title={title}
        description={description}
        onBack={() => requestLeave(goToList)}
        footer={footer}
        footerBanner={
          step === EVENT_WIZARD_STEP.DETAILS && submitError ? (
            <EventWizardErrorAlert title={t('wizard.submitErrorTitle')} message={submitError} />
          ) : null
        }
      >
        <EventWizardStepper currentStep={step} onStepSelect={handleStepSelect} className="mb-8" />

        {step === EVENT_WIZARD_STEP.LOCATION ? (
          <>
            {submitError ? <EventWizardErrorAlert message={submitError} className="mb-6" /> : null}
            <EventWizardStepLocation
              locationMode={locationMode}
              locationId={locationId}
              lastUsedLocationId={lastUsedLocationId}
              newLocationFormRef={newLocationFormRef}
              newLocationDefaults={newLocationValues}
              onLocationModeChange={handleLocationModeChange}
              onLocationIdChange={handleLocationIdChange}
              onNewLocationDirtyChange={handleNewLocationDirty}
            />
          </>
        ) : (
          <>
            <EventWizardLocationSummary
              name={selectedLocationName}
              isNew={isNewLocation}
              disabled={isSubmitting}
              onChange={handleBackToLocation}
              className="mb-6"
            />
            <EventWizardStepDetails
              ref={detailsFormRef}
              defaultValues={detailsValues}
              onDirtyChange={handleDetailsDirty}
            />
          </>
        )}
      </EventWizardPageLayout>

      <EventUnsavedChangesDialog
        open={unsavedOpen}
        onOpenChange={setUnsavedOpen}
        onConfirmLeave={() => leaveActionRef.current()}
      />
    </>
  )
}
