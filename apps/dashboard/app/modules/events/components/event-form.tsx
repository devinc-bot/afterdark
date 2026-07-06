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
import { useClubs } from '~/modules/club-management/queries/use-club-management-queries'
import { useCreateEvent, useUpdateEvent } from '~/modules/events/mutation/use-event-mutations'
import { EMPTY_EVENT_FORM_VALUES } from '~/modules/events/utils/event-form.mapper'

export const EVENT_FORM_MODE = {
  CREATE: 'create',
  EDIT: 'edit',
} as const

export type EventFormMode = (typeof EVENT_FORM_MODE)[keyof typeof EVENT_FORM_MODE]

export const EVENT_FORM_ID = 'event-form'

type ClubSelectFieldDisplayInput = {
  isLoading: boolean
  isError: boolean
  clubCount: number
  fieldError: string | null
  t: TFunction<'events'>
}

type ClubSelectFieldDisplay = {
  placeholder: string
  error: string | undefined
}

function getClubSelectFieldDisplay({
  isLoading,
  isError,
  clubCount,
  fieldError,
  t,
}: ClubSelectFieldDisplayInput): ClubSelectFieldDisplay {
  if (isLoading) {
    return { placeholder: t('form.clubLoading'), error: fieldError ?? undefined }
  }

  if (isError) {
    return {
      placeholder: t('form.clubPlaceholder'),
      error: t('form.clubsLoadError'),
    }
  }

  if (clubCount === 0) {
    return { placeholder: t('form.clubEmpty'), error: fieldError ?? undefined }
  }

  return {
    placeholder: t('form.clubPlaceholder'),
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
  const { data: clubs = [], isLoading: isClubsLoading, isError: isClubsError } = useClubs()

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

          <form.Field name="clubId" validators={{ onSubmit: eventFormSchema.shape.clubId }}>
            {(field) => {
              const error = resolveFieldError(field.state.meta.errors)
              const { placeholder: clubPlaceholder, error: clubFieldError } =
                getClubSelectFieldDisplay({
                  isLoading: isClubsLoading,
                  isError: isClubsError,
                  clubCount: clubs.length,
                  fieldError: error,
                  t,
                })

              return (
                <SelectField
                  label={requiredFieldLabel(t('form.club'))}
                  value={field.state.value || undefined}
                  onValueChange={(value) => field.handleChange(value)}
                  placeholder={clubPlaceholder}
                  error={clubFieldError}
                  disabled={isClubsLoading || clubs.length === 0}
                >
                  {clubs.map((club) => (
                    <SelectItem key={club.documentId} value={club.documentId}>
                      {club.name}
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
