import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import type { EventResponse } from '@repo/types'
import { parseEventFormToCreateInput, parseEventFormToUpdateInput } from '@repo/validators'
import { toast } from '@repo/ui'
import {
  type EventDetailsFormHandle,
  type EventDetailsValues,
} from '~/modules/events/components/event-details-form'
import type { EventFaqFormHandle } from '~/modules/events/components/event-faq-form'
import { useCreateEvent, useUpdateEvent } from '~/modules/events/mutation/use-event-mutations'
import {
  EMPTY_EVENT_FORM_VALUES,
  eventResponseToFormValues,
} from '~/modules/events/utils/event-form.mapper'
import { EVENT_FORM_MODE, type EventFormMode } from '~/modules/events/utils/event-form.types'
import {
  readLastEventLocationId,
  saveLastEventLocationId,
} from '~/modules/events/utils/last-location.storage'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import { useLocations } from '~/modules/locations/queries/use-locations-queries'

type UseEventFormProps = {
  mode: EventFormMode
  event?: EventResponse
}

function buildDetailsDefaults(event?: EventResponse): EventDetailsValues {
  const fields = event ? eventResponseToFormValues(event) : EMPTY_EVENT_FORM_VALUES

  return {
    name: fields.name,
    description: fields.description,
    startsAt: fields.startsAt,
    durationHours: fields.durationHours,
    status: fields.status,
    existingImages: event?.images ?? [],
    eventImg: [],
  }
}

export function useEventForm({ mode, event }: UseEventFormProps) {
  const { t } = useTranslation('events')
  const navigate = useNavigate()
  const isCreate = mode === EVENT_FORM_MODE.CREATE

  const [locationId, setLocationId] = useState(event?.locationId ?? '')
  const [detailsValues] = useState<EventDetailsValues>(() => buildDetailsDefaults(event))
  const [locationDirty, setLocationDirty] = useState(false)
  const [detailsDirty, setDetailsDirty] = useState(false)
  const [faqDirty, setFaqDirty] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [lastUsedLocationId, setLastUsedLocationId] = useState<string | null>(null)

  const detailsFormRef = useRef<EventDetailsFormHandle | null>(null)
  const faqFormRef = useRef<EventFaqFormHandle | null>(null)
  const appliedLastLocationRef = useRef(false)

  const createEventMutation = useCreateEvent()
  const updateEventMutation = useUpdateEvent()

  const {
    data: locations = [],
    isLoading: isLocationsLoading,
    isError: isLocationsError,
  } = useLocations()

  const initialLocationId = event?.locationId ?? ''
  const anyDirty = locationDirty || detailsDirty || faqDirty
  const canSubmit = locations.length > 0 && locationId.length > 0
  const defaultFaqs = event
    ? event.faqs.map(({ question, answer }) => ({ question, answer }))
    : EMPTY_EVENT_FORM_VALUES.faqs

  const goToList = useCallback(() => {
    navigate({ to: DASHBOARD_ROUTES.events() })
  }, [navigate])

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

  const handleLocationIdChange = useCallback(
    (nextLocationId: string) => {
      setLocationId(nextLocationId)
      setLocationDirty(nextLocationId !== initialLocationId)
      setSubmitError(null)
    },
    [initialLocationId]
  )

  const handleDetailsDirty = useCallback((dirty: boolean) => {
    setDetailsDirty(dirty)
  }, [])

  const handleFaqDirty = useCallback((dirty: boolean) => {
    setFaqDirty(dirty)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!locationId) {
      setSubmitError(t('form.locationRequiredError'))
      return
    }

    const [detailsValid, faqsValid] = await Promise.all([
      detailsFormRef.current?.validate() ?? false,
      faqFormRef.current?.validate() ?? false,
    ])
    if (!detailsValid || !faqsValid) return

    const captured = detailsFormRef.current?.getValues()
    const faqs = faqFormRef.current?.getValues() ?? []
    if (!captured) return

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const formFields = {
        ...captured.details,
        locationId,
        faqs,
      }

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
      setFaqDirty(false)

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
  }, [locationId, isCreate, event, createEventMutation, updateEventMutation, navigate, goToList, t])

  return {
    isCreate,
    locations,
    isLocationsLoading,
    isLocationsError,
    locationId,
    lastUsedLocationId,
    detailsValues,
    defaultFaqs,
    detailsFormRef,
    faqFormRef,
    anyDirty,
    canSubmit,
    isSubmitting,
    submitError,
    goToList,
    handleLocationIdChange,
    handleDetailsDirty,
    handleFaqDirty,
    handleSubmit,
  }
}
