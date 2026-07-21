import { useEffect, useImperativeHandle, useRef } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import type { EventImageResponse } from '@afterdark/types'
import { EVENT_STATUS, type EventStatus } from '@afterdark/types'
import { eventFieldSchemas, type EventDetailsFormValues } from '@afterdark/validators'
import { useResolveFieldError } from '@afterdark/i18n/client'
import {
  DateTimeInput,
  Field,
  Input,
  requiredFieldLabel,
  SelectField,
  SelectItem,
  Textarea,
} from '@afterdark/ui'
import { EventFormSection } from '~/modules/events/components/event-form-section'
import { ImagesEventForm } from '~/modules/events/components/images-event-form'

export type EventDetailsValues = EventDetailsFormValues & {
  existingImages: EventImageResponse[]
  eventImg: File[]
}

export type EventDetailsFormHandle = {
  validate: () => Promise<boolean>
  getValues: () => {
    details: EventDetailsFormValues
    existingImages: EventImageResponse[]
    newImages: File[]
  }
}

type EventDetailsFormProps = {
  ref?: React.Ref<EventDetailsFormHandle>
  defaultValues: EventDetailsValues
  onDirtyChange?: (isDirty: boolean) => void
}

function snapshotDetailsValues(values: EventDetailsValues): string {
  return JSON.stringify({
    name: values.name,
    description: values.description,
    startsAt: values.startsAt,
    endsAt: values.endsAt,
    status: values.status,
    existingImageIds: values.existingImages.map((image) => image.documentId).sort(),
    newImages: values.eventImg.map((file) => `${file.name}:${file.size}:${file.lastModified}`),
  })
}

export function EventDetailsForm({ ref, defaultValues, onDirtyChange }: EventDetailsFormProps) {
  const { t } = useTranslation('events')
  const resolveFieldError = useResolveFieldError()
  const initialSnapshotRef = useRef(snapshotDetailsValues(defaultValues))

  const form = useForm({
    defaultValues,
    onSubmit: () => {
      // Submission is orchestrated by the parent page; this form only validates.
    },
  })

  useImperativeHandle(ref, () => ({
    validate: async () => {
      await form.handleSubmit()
      return form.state.isValid
    },
    getValues: () => {
      const values = form.state.values
      return {
        details: {
          name: values.name,
          description: values.description,
          startsAt: values.startsAt,
          endsAt: values.endsAt,
          status: values.status,
        },
        existingImages: values.existingImages,
        newImages: values.eventImg,
      }
    },
  }))

  const eventStatusOptions: { value: EventStatus; label: string }[] = [
    { value: EVENT_STATUS.DRAFT, label: t('form.statusDraft') },
    { value: EVENT_STATUS.PUBLISHED, label: t('form.statusPublished') },
    { value: EVENT_STATUS.FINISHED, label: t('form.statusFinished') },
  ]

  return (
    <>
      <form.Subscribe selector={(state) => state.values}>
        {(values) => (
          <DetailsDirtyReporter
            values={values}
            initialSnapshot={initialSnapshotRef.current}
            onDirtyChange={onDirtyChange}
          />
        )}
      </form.Subscribe>

      <form
        noValidate
        className="flex flex-col gap-12"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <EventFormSection
          id="event-details-form"
          title={t('form.detailsSectionTitle')}
          description={t('form.detailsSectionDescription')}
        >
          <p className="text-xs text-ink-muted">{t('form.requiredFieldsHint')}</p>

          <form.Field name="name" validators={{ onSubmit: eventFieldSchemas.name }}>
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

          <form.Field name="description" validators={{ onSubmit: eventFieldSchemas.description }}>
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
            <form.Field name="startsAt" validators={{ onSubmit: eventFieldSchemas.startsAt }}>
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

            <form.Field
              name="endsAt"
              validators={{
                onSubmit: ({ value, fieldApi }) => {
                  const base = eventFieldSchemas.endsAt.safeParse(value)
                  if (!base.success) {
                    return base.error.issues[0]?.message
                  }

                  const startsAt = fieldApi.form.getFieldValue('startsAt')
                  if (startsAt) {
                    const start = new Date(startsAt)
                    const end = new Date(value)
                    if (
                      !Number.isNaN(start.getTime()) &&
                      !Number.isNaN(end.getTime()) &&
                      end <= start
                    ) {
                      return 'validation:field.event.endDateAfterStart'
                    }
                  }

                  return undefined
                },
              }}
            >
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

          <form.Field name="status" validators={{ onSubmit: eventFieldSchemas.status }}>
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
        </EventFormSection>

        <EventFormSection
          id="event-images-form"
          title={t('sections.imagesTitle')}
          description={t('sections.imagesDescription')}
        >
          <form.Field name="existingImages">
            {(existingField) => (
              <form.Field name="eventImg">
                {(newField) => (
                  <ImagesEventForm
                    existingImages={existingField.state.value}
                    onExistingImagesChange={existingField.handleChange}
                    newImages={newField.state.value}
                    onNewImagesChange={newField.handleChange}
                  />
                )}
              </form.Field>
            )}
          </form.Field>
        </EventFormSection>
      </form>
    </>
  )
}

function DetailsDirtyReporter({
  values,
  initialSnapshot,
  onDirtyChange,
}: {
  values: EventDetailsValues
  initialSnapshot: string
  onDirtyChange?: (isDirty: boolean) => void
}) {
  useEffect(() => {
    const isDirty = snapshotDetailsValues(values) !== initialSnapshot
    onDirtyChange?.(isDirty)
  }, [values, initialSnapshot, onDirtyChange])

  return null
}
