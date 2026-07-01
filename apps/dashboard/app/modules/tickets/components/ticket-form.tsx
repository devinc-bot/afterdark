import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { TICKET_STATUS, TICKET_TYPE, type TicketStatus, type TicketType } from '@afterdark/types'
import {
  parseTicketFormToCreateInput,
  parseTicketFormToUpdateInput,
  ticketFormSchema,
  type TicketFormValues,
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
import { useCreateTicket, useUpdateTicket } from '~/modules/tickets/mutation/use-ticket-mutations'
import { EMPTY_TICKET_FORM_VALUES } from '~/modules/tickets/utils/ticket-form.mapper'

export const TICKET_FORM_MODE = {
  CREATE: 'create',
  EDIT: 'edit',
} as const

export type TicketFormMode = (typeof TICKET_FORM_MODE)[keyof typeof TICKET_FORM_MODE]

export const TICKET_FORM_ID = 'ticket-form'

type ClubSelectFieldDisplayInput = {
  isLoading: boolean
  isError: boolean
  clubCount: number
  fieldError: string | null
  t: TFunction<'tickets'>
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

function sanitizeNonNegativeDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function sanitizePrice(value: string): string {
  return value.replace(/[^\d.,]/g, '')
}

type TicketFormProps = {
  mode: TicketFormMode
  documentId?: string
  defaultValues?: TicketFormValues
  onSuccess: () => void
}

export function TicketForm({ mode, documentId, defaultValues, onSuccess }: TicketFormProps) {
  const { t } = useTranslation('tickets')
  const resolveFieldError = useResolveFieldError()
  const { data: clubs = [], isLoading: isClubsLoading, isError: isClubsError } = useClubs()
  const createTicketMutation = useCreateTicket()
  const updateTicketMutation = useUpdateTicket()

  const isEdit = mode === TICKET_FORM_MODE.EDIT
  const initialValues = defaultValues ?? EMPTY_TICKET_FORM_VALUES

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: ticketFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEdit) {
          if (!documentId) return
          await updateTicketMutation.mutateAsync({
            documentId,
            input: parseTicketFormToUpdateInput(value),
          })
          toast.success(t('form.successEdit'))
        } else {
          await createTicketMutation.mutateAsync(parseTicketFormToCreateInput(value))
          toast.success(t('form.successCreate'))
        }

        form.reset()
        onSuccess()
      } catch {
        toast.error(isEdit ? t('form.errorEdit') : t('form.errorCreate'))
      }
    },
  })

  const ticketTypeOptions: { value: TicketType; label: string }[] = [
    { value: TICKET_TYPE.GENERAL, label: t('form.typeGeneral') },
    { value: TICKET_TYPE.VIP, label: t('form.typeVip') },
  ]

  const ticketStatusOptions: { value: TicketStatus; label: string }[] = [
    { value: TICKET_STATUS.ACTIVE, label: t('form.statusActive') },
    { value: TICKET_STATUS.INACTIVE, label: t('form.statusInactive') },
  ]

  const isSubmitting = createTicketMutation.isPending || updateTicketMutation.isPending

  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        <form
          id={TICKET_FORM_ID}
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field name="name" validators={{ onSubmit: ticketFormSchema.shape.name }}>
            {(field) => {
              const error = resolveFieldError(field.state.meta.errors)

              return (
                <Field label={t('form.name')} htmlFor={field.name} error={error}>
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

          <form.Field name="clubId" validators={{ onSubmit: ticketFormSchema.shape.clubId }}>
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
                  label={t('form.club')}
                  value={field.state.value || undefined}
                  onValueChange={(value) => field.handleChange(value)}
                  placeholder={clubPlaceholder}
                  error={clubFieldError}
                  disabled={isEdit || isClubsLoading || clubs.length === 0}
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

          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field name="type" validators={{ onSubmit: ticketFormSchema.shape.type }}>
              {(field) => {
                const error = resolveFieldError(field.state.meta.errors)

                return (
                  <SelectField
                    label={t('form.type')}
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value as TicketType)}
                    placeholder={t('form.typePlaceholder')}
                    error={error ?? undefined}
                  >
                    {ticketTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectField>
                )
              }}
            </form.Field>

            <form.Field name="status" validators={{ onSubmit: ticketFormSchema.shape.status }}>
              {(field) => {
                const error = resolveFieldError(field.state.meta.errors)

                return (
                  <SelectField
                    label={t('form.status')}
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value as TicketStatus)}
                    placeholder={t('form.statusPlaceholder')}
                    error={error ?? undefined}
                  >
                    {ticketStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectField>
                )
              }}
            </form.Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field name="price" validators={{ onSubmit: ticketFormSchema.shape.price }}>
              {(field) => {
                const error = resolveFieldError(field.state.meta.errors)

                return (
                  <Field label={t('form.price')} htmlFor={field.name} error={error}>
                    <Input
                      id={field.name}
                      name={field.name}
                      inputMode="decimal"
                      value={field.state.value}
                      placeholder={t('form.pricePlaceholder')}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(sanitizePrice(event.target.value))}
                      aria-invalid={error ? true : undefined}
                    />
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="quantity" validators={{ onSubmit: ticketFormSchema.shape.quantity }}>
              {(field) => {
                const error = resolveFieldError(field.state.meta.errors)

                return (
                  <Field label={t('form.quantity')} htmlFor={field.name} error={error}>
                    <Input
                      id={field.name}
                      name={field.name}
                      inputMode="numeric"
                      value={field.state.value}
                      placeholder={t('form.quantityPlaceholder')}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(sanitizeNonNegativeDigits(event.target.value))
                      }
                      aria-invalid={error ? true : undefined}
                    />
                  </Field>
                )
              }}
            </form.Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field
              name="startDate"
              validators={{ onSubmit: ticketFormSchema.shape.startDate }}
            >
              {(field) => {
                const error = resolveFieldError(field.state.meta.errors)

                return (
                  <Field label={t('form.startDate')} htmlFor={field.name} error={error}>
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

            <form.Field name="endDate" validators={{ onSubmit: ticketFormSchema.shape.endDate }}>
              {(field) => {
                const error = resolveFieldError(field.state.meta.errors)

                return (
                  <Field label={t('form.endDate')} htmlFor={field.name} error={error}>
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

          <form.Field
            name="description"
            validators={{ onSubmit: ticketFormSchema.shape.description }}
          >
            {(field) => {
              const error = resolveFieldError(field.state.meta.errors)

              return (
                <Field label={t('form.details')} htmlFor={field.name} error={error}>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    placeholder={t('form.detailsPlaceholder')}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={error ? true : undefined}
                    rows={3}
                  />
                </Field>
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
          form={TICKET_FORM_ID}
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
