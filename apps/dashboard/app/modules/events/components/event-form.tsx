import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { EVENT_STATUS, type EventStatus } from '@afterdark/types'
import {
  eventFormSchema,
  parseEventFormToCreateInput,
  parseEventFormToUpdateInput,
  type EventFormValues,
} from '@afterdark/validators'
import { useResolveFieldError } from '@afterdark/i18n/client'
import {
  Button,
  DialogClose,
  DialogFooter,
  DateTimeInput,
  Field,
  Input,
  SelectField,
  SelectItem,
  Textarea,
  toast,
} from '@afterdark/ui'
import type { TFunction } from 'i18next'
import { useLocations } from '~/modules/locations/queries/use-locations-queries'
import { useCreateEvent, useUpdateEvent } from '~/modules/events/mutation/use-event-mutations'
import { EMPTY_EVENT_FORM_VALUES } from '~/modules/events/utils/event-form.mapper'

export const EVENT_FORM_MODE = {
  CREATE: 'create',
  EDIT: 'edit',
} as const

export type EventFormMode = (typeof EVENT_FORM_MODE)[keyof typeof EVENT_FORM_MODE]

export const EVENT_FORM_ID = 'event-form'

type LocationSelectFieldDisplayInput = {
  isLoading: boolean
  isError: boolean
  locationCount: number
  fieldError: string | null
  t: TFunction<'events'>
}

type LocationSelectFieldDisplay = {
  placeholder: string
  error: string | undefined
}

function getLocationSelectFieldDisplay({
  isLoading,
  isError,
  locationCount,
  fieldError,
  t,
}: LocationSelectFieldDisplayInput): LocationSelectFieldDisplay {
  if (isLoading) {
    return { placeholder: t('form.locationLoading'), error: fieldError ?? undefined }
  }

  if (isError) {
    return {
      placeholder: t('form.locationPlaceholder'),
      error: t('form.locationsLoadError'),
    }
  }

  if (locationCount === 0) {
    return { placeholder: t('form.locationEmpty'), error: fieldError ?? undefined }
  }

  return {
    placeholder: t('form.locationPlaceholder'),
    error: fieldError ?? undefined,
  }
}

function requiredFieldLabel(label: string): string {
  return `${label} *`
}

type EventFormProps = {
  mode: EventFormMode
  documentId?: string
  defaultValues?: EventFormValues
  onSuccess: () => void
}

export function EventForm({ mode, documentId, defaultValues, onSuccess }: EventFormProps) {
  const { t } = useTranslation('events')
  const resolveFieldError = useResolveFieldError()
  const createEventMutation = useCreateEvent()
  const updateEventMutation = useUpdateEvent()
  const {
    data: locations = [],
    isLoading: isLocationsLoading,
    isError: isLocationsError,
  } = useLocations()

  const isEdit = mode === EVENT_FORM_MODE.EDIT
  const initialValues = defaultValues ?? EMPTY_EVENT_FORM_VALUES

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: eventFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEdit) {
          if (!documentId) return
          await updateEventMutation.mutateAsync({
            documentId,
            input: parseEventFormToUpdateInput(value),
          })
          toast.success(t('form.successEdit'))
        } else {
          await createEventMutation.mutateAsync(parseEventFormToCreateInput(value))
          toast.success(t('form.successCreate'))
        }

        form.reset()
        onSuccess()
      } catch {
        toast.error(isEdit ? t('form.errorEdit') : t('form.errorCreate'))
      }
    },
  })

  const eventStatusOptions: { value: EventStatus; label: string }[] = [
    { value: EVENT_STATUS.DRAFT, label: t('form.statusDraft') },
    { value: EVENT_STATUS.PUBLISHED, label: t('form.statusPublished') },
    { value: EVENT_STATUS.FINISHED, label: t('form.statusFinished') },
  ]

  const isSubmitting = createEventMutation.isPending || updateEventMutation.isPending

  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        <form
          id={EVENT_FORM_ID}
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <p className="text-xs text-ink-muted">{t('form.requiredFieldsHint')}</p>

          <form.Field name="locationId" validators={{ onSubmit: eventFormSchema.shape.locationId }}>
            {(field) => {
              const error = resolveFieldError(field.state.meta.errors)
              const { placeholder: locationPlaceholder, error: locationFieldError } =
                getLocationSelectFieldDisplay({
                  isLoading: isLocationsLoading,
                  isError: isLocationsError,
                  locationCount: locations.length,
                  fieldError: error,
                  t,
                })

              return (
                <SelectField
                  label={requiredFieldLabel(t('form.location'))}
                  value={field.state.value || undefined}
                  onValueChange={(value) => field.handleChange(value)}
                  placeholder={locationPlaceholder}
                  error={locationFieldError}
                  disabled={isLocationsLoading || locations.length === 0}
                >
                  {locations.map((location) => (
                    <SelectItem key={location.documentId} value={location.documentId}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectField>
              )
            }}
          </form.Field>

          <form.Field name="name" validators={{ onSubmit: eventFormSchema.shape.name }}>
            {(field) => {
              const error = resolveFieldError(field.state.meta.errors)

              return (
                <Field
                  label={requiredFieldLabel(t('form.name'))}
                  htmlFor={field.name}
                  error={error}
                >
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    placeholder={t('form.namePlaceholder')}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={error ? true : undefined}
                  />
                </Field>
              )
            }}
          </form.Field>

          <form.Field
            name="description"
            validators={{ onSubmit: eventFormSchema.shape.description }}
          >
            {(field) => {
              const error = resolveFieldError(field.state.meta.errors)

              return (
                <Field
                  label={requiredFieldLabel(t('form.description'))}
                  htmlFor={field.name}
                  error={error}
                >
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    placeholder={t('form.descriptionPlaceholder')}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={error ? true : undefined}
                    rows={3}
                  />
                </Field>
              )
            }}
          </form.Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field name="startsAt" validators={{ onSubmit: eventFormSchema.shape.startsAt }}>
              {(field) => {
                const error = resolveFieldError(field.state.meta.errors)

                return (
                  <Field
                    label={requiredFieldLabel(t('form.startsAt'))}
                    htmlFor={field.name}
                    error={error}
                  >
                    <DateTimeInput
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={error ? true : undefined}
                    />
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="endsAt" validators={{ onSubmit: eventFormSchema.shape.endsAt }}>
              {(field) => {
                const error = resolveFieldError(field.state.meta.errors)

                return (
                  <Field
                    label={requiredFieldLabel(t('form.endsAt'))}
                    htmlFor={field.name}
                    error={error}
                  >
                    <DateTimeInput
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={error ? true : undefined}
                    />
                  </Field>
                )
              }}
            </form.Field>
          </div>

          <form.Field name="status" validators={{ onSubmit: eventFormSchema.shape.status }}>
            {(field) => {
              const error = resolveFieldError(field.state.meta.errors)

              return (
                <SelectField
                  label={requiredFieldLabel(t('form.status'))}
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as EventStatus)}
                  placeholder={t('form.statusPlaceholder')}
                  error={error ?? undefined}
                >
                  {eventStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectField>
              )
            }}
          </form.Field>
        </form>
      </div>

      <DialogFooter className="mx-0 mb-0 mt-0 shrink-0 flex-col gap-3 border-t border-hairline px-6 py-6 sm:flex-row sm:justify-end sm:px-8">
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            size="default"
            disabled={isSubmitting}
            className="min-w-36 sm:min-w-40"
          >
            {t('form.cancel')}
          </Button>
        </DialogClose>
        <Button
          type="submit"
          form={EVENT_FORM_ID}
          size="default"
          loading={isSubmitting}
          className="min-w-36 sm:min-w-40"
        >
          {isSubmitting
            ? isEdit
              ? t('form.submittingEdit')
              : t('form.submittingCreate')
            : isEdit
              ? t('form.submitEdit')
              : t('form.submitCreate')}
        </Button>
      </DialogFooter>
    </>
  )
}
