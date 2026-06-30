import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from '@tanstack/react-form'
import { CLUB_STATUS, type ClubImageResponse } from '@afterdark/types'
import { createClubSchema, clubStatusSchema, type CreateClubInput } from '@afterdark/validators'
import {
  fieldErrorMessage,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  toast,
} from '@afterdark/ui'
import { ImagesClubForm } from '~/modules/club-management/components/images-club-form'
import {
  type useCreateClub,
  type useUpdateClub,
} from '~/modules/club-management/mutation/use-club-management-mutations'
import { snapshotClubFormValues } from '~/modules/club-management/utils/club-form.mapper'

export const CLUB_FORM_MODE = {
  CREATE: 'create',
  EDIT: 'edit',
} as const

export type ClubFormMode = (typeof CLUB_FORM_MODE)[keyof typeof CLUB_FORM_MODE]

export const CLUB_FORM_ID = 'club-form'

export type ClubFormValues = CreateClubInput & {
  existingImages: ClubImageResponse[]
  clubImg: File[]
}

export const EMPTY_CLUB_FORM_VALUES: ClubFormValues = {
  name: '',
  address: '',
  capacity: '',
  description: '',
  status: CLUB_STATUS.ACTIVE,
  state: '',
  street_number: '',
  city: '',
  existingImages: [],
  clubImg: [],
}

const fieldLabelClassName =
  'font-label text-xs font-semibold uppercase tracking-label-xs text-ink-muted'

const fieldErrorMessageClassName = 'text-xs text-error'

function sanitizeNonNegativeDigits(value: string): string {
  return value.replace(/\D/g, '')
}

type ClubFormFieldProps = {
  id: string
  label: string
  placeholder?: string
  value: string
  error: string | null
  onBlur: () => void
  onChange: (value: string) => void
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  sanitize?: (value: string) => string
}

function ClubFormField({
  id,
  label,
  placeholder,
  value,
  error,
  onBlur,
  onChange,
  inputMode,
  sanitize,
}: ClubFormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className={fieldLabelClassName}>
        {label}
      </Label>
      <Input
        id={id}
        name={id}
        type="text"
        inputMode={inputMode}
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onBlur={onBlur}
        onChange={(event) => onChange(sanitize ? sanitize(event.target.value) : event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className={fieldErrorMessageClassName}>
          {error}
        </p>
      ) : null}
    </div>
  )
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  const headingId = title.toLowerCase().replace(/\s+/g, '-')

  return (
    <section className="flex flex-col gap-4" aria-labelledby={headingId}>
      <div className="flex flex-col gap-1 border-b border-hairline pb-3">
        <h2 id={headingId} className="font-heading text-sm font-semibold text-ink">
          {title}
        </h2>
        {description ? <p className="text-sm text-ink-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

type ClubFormProps = {
  mode: ClubFormMode
  clubDocumentId?: string
  defaultValues?: Partial<ClubFormValues>
  createClubMutation: ReturnType<typeof useCreateClub>
  updateClubMutation: ReturnType<typeof useUpdateClub>
  onDirtyChange?: (isDirty: boolean) => void
  onSuccess?: () => void
}

export function ClubForm({
  mode,
  clubDocumentId,
  defaultValues,
  createClubMutation,
  updateClubMutation,
  onDirtyChange,
  onSuccess,
}: ClubFormProps) {
  const { t } = useTranslation('clubs')
  const isCreate = mode === CLUB_FORM_MODE.CREATE
  const initialSnapshotRef = useRef(
    snapshotClubFormValues({ ...EMPTY_CLUB_FORM_VALUES, ...defaultValues })
  )

  const clubStatusOptions = [
    { value: CLUB_STATUS.ACTIVE, label: t('form.fields.statusActive') },
    { value: CLUB_STATUS.INACTIVE, label: t('form.fields.statusInactive') },
  ]

  const form = useForm({
    defaultValues: { ...EMPTY_CLUB_FORM_VALUES, ...defaultValues },
    onSubmit: async ({ value }) => {
      if (isCreate) {
        const formData = new FormData()

        formData.append('name', value.name)
        formData.append('capacity', value.capacity)
        formData.append('description', value.description)
        formData.append('status', value.status)
        formData.append('address', value.address)
        formData.append('street_number', value.street_number)
        formData.append('city', value.city)
        formData.append('state', value.state)

        for (const image of value.clubImg) {
          formData.append('images', image)
        }

        try {
          await createClubMutation.mutateAsync(formData)
          toast.success(t('formPage.toastCreateSuccess'))
          onSuccess?.()
        } catch (error) {
          toast.error(error instanceof Error ? error.message : t('formPage.toastCreateError'))
        }
        return
      }

      const { clubImg, existingImages, ...clubPayload } = value

      if (!clubDocumentId) {
        toast.error(t('formPage.toastMissingClubId'))
        return
      }

      const formData = new FormData()

      formData.append('name', clubPayload.name)
      formData.append('capacity', clubPayload.capacity)
      formData.append('description', clubPayload.description)
      formData.append('status', clubPayload.status)
      formData.append('address', clubPayload.address)
      formData.append('street_number', clubPayload.street_number)
      formData.append('city', clubPayload.city)
      formData.append('state', clubPayload.state)

      for (const image of existingImages) {
        formData.append('keepImageIds', image.documentId)
      }

      for (const image of clubImg) {
        formData.append('images', image)
      }

      try {
        await updateClubMutation.mutateAsync({ documentId: clubDocumentId, formData })
        toast.success(t('formPage.toastEditSuccess'))
        onSuccess?.()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t('formPage.toastEditError'))
      }
    },
  })

  return (
    <form
      id={CLUB_FORM_ID}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Subscribe selector={(state) => state.values}>
        {(values) => (
          <DirtyTracker
            values={values}
            initialSnapshot={initialSnapshotRef.current}
            onDirtyChange={onDirtyChange}
          />
        )}
      </form.Subscribe>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-8">
          <FormSection
            title={t('sections.generalTitle')}
            description={t('sections.generalDescription')}
          >
            <form.Field name="name" validators={{ onSubmit: createClubSchema.shape.name }}>
              {(field) => (
                <ClubFormField
                  id={field.name}
                  label={t('form.fields.name')}
                  placeholder={t('form.fields.namePlaceholder')}
                  value={field.state.value}
                  error={fieldErrorMessage(field.state.meta.errors)}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                />
              )}
            </form.Field>

            <form.Field name="capacity" validators={{ onSubmit: createClubSchema.shape.capacity }}>
              {(field) => (
                <ClubFormField
                  id={field.name}
                  label={t('form.fields.capacity')}
                  placeholder={t('form.fields.capacityPlaceholder')}
                  inputMode="numeric"
                  sanitize={sanitizeNonNegativeDigits}
                  value={field.state.value}
                  error={fieldErrorMessage(field.state.meta.errors)}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                />
              )}
            </form.Field>

            <form.Field name="status" validators={{ onSubmit: clubStatusSchema }}>
              {(field) => {
                const error = fieldErrorMessage(field.state.meta.errors)

                return (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name} className={fieldLabelClassName}>
                      {t('form.fields.status')}
                    </Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(value as CreateClubInput['status'])
                      }
                      onOpenChange={(open) => {
                        if (!open) field.handleBlur()
                      }}
                    >
                      <SelectTrigger
                        id={field.name}
                        error={Boolean(error)}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? `${field.name}-error` : undefined}
                      >
                        <SelectValue placeholder={t('form.fields.statusPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {clubStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {error ? (
                      <p
                        id={`${field.name}-error`}
                        role="alert"
                        className={fieldErrorMessageClassName}
                      >
                        {error}
                      </p>
                    ) : null}
                  </div>
                )
              }}
            </form.Field>

            <form.Field
              name="description"
              validators={{ onSubmit: createClubSchema.shape.description }}
            >
              {(field) => {
                const error = fieldErrorMessage(field.state.meta.errors)

                return (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name} className={fieldLabelClassName}>
                      {t('form.fields.additionalInfo')}
                    </Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      placeholder={t('form.fields.additionalInfoPlaceholder')}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      error={error ?? undefined}
                      className="text-sm"
                    />
                  </div>
                )
              }}
            </form.Field>
          </FormSection>

          <FormSection
            title={t('sections.locationTitle')}
            description={t('sections.locationDescription')}
          >
            <form.Field name="address" validators={{ onSubmit: createClubSchema.shape.address }}>
              {(field) => (
                <ClubFormField
                  id={field.name}
                  label={t('form.fields.address')}
                  placeholder={t('form.fields.addressPlaceholder')}
                  value={field.state.value}
                  error={fieldErrorMessage(field.state.meta.errors)}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                />
              )}
            </form.Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field
                name="street_number"
                validators={{ onSubmit: createClubSchema.shape.street_number }}
              >
                {(field) => (
                  <ClubFormField
                    id={field.name}
                    label={t('form.fields.streetNumber')}
                    placeholder={t('form.fields.streetNumberPlaceholder')}
                    inputMode="numeric"
                    sanitize={sanitizeNonNegativeDigits}
                    value={field.state.value}
                    error={fieldErrorMessage(field.state.meta.errors)}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                  />
                )}
              </form.Field>

              <form.Field name="city" validators={{ onSubmit: createClubSchema.shape.city }}>
                {(field) => (
                  <ClubFormField
                    id={field.name}
                    label={t('form.fields.city')}
                    placeholder={t('form.fields.cityPlaceholder')}
                    value={field.state.value}
                    error={fieldErrorMessage(field.state.meta.errors)}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                  />
                )}
              </form.Field>
            </div>

            <form.Field name="state" validators={{ onSubmit: createClubSchema.shape.state }}>
              {(field) => (
                <ClubFormField
                  id={field.name}
                  label={t('form.fields.state')}
                  placeholder={t('form.fields.statePlaceholder')}
                  value={field.state.value}
                  error={fieldErrorMessage(field.state.meta.errors)}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                />
              )}
            </form.Field>
          </FormSection>
        </div>

        <FormSection
          title={t('sections.imagesTitle')}
          description={t('sections.imagesDescription')}
        >
          <form.Field name="existingImages">
            {(existingField) => (
              <form.Field name="clubImg">
                {(newField) => (
                  <ImagesClubForm
                    existingImages={existingField.state.value}
                    onExistingImagesChange={existingField.handleChange}
                    newImages={newField.state.value}
                    onNewImagesChange={newField.handleChange}
                  />
                )}
              </form.Field>
            )}
          </form.Field>
        </FormSection>
      </div>
    </form>
  )
}

function DirtyTracker({
  values,
  initialSnapshot,
  onDirtyChange,
}: {
  values: ClubFormValues
  initialSnapshot: string
  onDirtyChange?: (isDirty: boolean) => void
}) {
  useEffect(() => {
    const isDirty = snapshotClubFormValues(values) !== initialSnapshot
    onDirtyChange?.(isDirty)
  }, [values, initialSnapshot, onDirtyChange])

  return null
}
