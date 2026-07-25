import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import {
  createStaffInvitationSchema,
  STAFF_INVITATION_EXPIRY_OPTIONS,
  type CreateStaffInvitationInput,
  type StaffInvitationExpiryMs,
} from '@repo/validators'
import {
  Button,
  DialogClose,
  DialogFooter,
  Field,
  Input,
  SelectField,
  SelectItem,
  toast,
} from '@repo/ui'
import type { TFunction } from 'i18next'
import { useResolveFieldError } from '@repo/i18n/client'
import { useLocations } from '~/modules/locations/queries/use-locations-queries'
import { postStaffInvitation } from '~/modules/staff/services/staff-invitations.service'

const STAFF_USER_FORM_ID = 'staff-user-form'

const EMPTY_STAFF_INVITATION_FORM_VALUES: CreateStaffInvitationInput = {
  email: '',
  locationId: '',
  securityWord: '',
  expiresInMs: STAFF_INVITATION_EXPIRY_OPTIONS['12h'],
}

type LocationSelectFieldDisplayInput = {
  isLoading: boolean
  isError: boolean
  locationCount: number
  fieldError: string | null
  t: TFunction<'staff'>
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

export type StaffInvitationSuccess = {
  url: string
  expiresAt: number
  expiresInMs: number
  hasSecurityWord: boolean
}

type StaffUserFormProps = {
  onInviteSuccess: (invitation: StaffInvitationSuccess) => void
}

export function StaffUserForm({ onInviteSuccess }: StaffUserFormProps) {
  const { t } = useTranslation('staff')
  const resolveFieldError = useResolveFieldError()
  const {
    data: locations = [],
    isLoading: isLocationsLoading,
    isError: isLocationsError,
  } = useLocations()

  const form = useForm({
    defaultValues: EMPTY_STAFF_INVITATION_FORM_VALUES,
    validators: {
      onSubmit: createStaffInvitationSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await postStaffInvitation(value)
        onInviteSuccess({
          url: response.url,
          expiresAt: new Date(response.expiresAt).getTime(),
          expiresInMs: value.expiresInMs,
          hasSecurityWord: response.hasSecurityWord,
        })
        toast.success(t('form.success'))
        form.reset()
      } catch {
        toast.error(t('form.error'))
      }
    },
  })

  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        <form
          id={STAFF_USER_FORM_ID}
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="email"
            validators={{ onSubmit: createStaffInvitationSchema.shape.email }}
          >
            {(field) => {
              const error = resolveFieldError(field.state.meta.errors)

              return (
                <Field label={t('form.email')} htmlFor={field.name} error={error}>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    value={field.state.value}
                    placeholder={t('form.emailPlaceholder')}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={error ? true : undefined}
                  />
                </Field>
              )
            }}
          </form.Field>

          <form.Field
            name="locationId"
            validators={{ onSubmit: createStaffInvitationSchema.shape.locationId }}
          >
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
                  label={t('form.location')}
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

          <form.Field
            name="expiresInMs"
            validators={{ onSubmit: createStaffInvitationSchema.shape.expiresInMs }}
          >
            {(field) => {
              const error = resolveFieldError(field.state.meta.errors)

              return (
                <SelectField
                  label={t('form.expiresIn')}
                  value={String(field.state.value)}
                  onValueChange={(value) =>
                    field.handleChange(Number(value) as StaffInvitationExpiryMs)
                  }
                  error={error ?? undefined}
                >
                  {(
                    Object.entries(STAFF_INVITATION_EXPIRY_OPTIONS) as Array<
                      [keyof typeof STAFF_INVITATION_EXPIRY_OPTIONS, number]
                    >
                  ).map(([key, ms]) => (
                    <SelectItem key={key} value={String(ms)}>
                      {t(`form.expires${key}`)}
                    </SelectItem>
                  ))}
                </SelectField>
              )
            }}
          </form.Field>

          <form.Field
            name="securityWord"
            validators={{ onSubmit: createStaffInvitationSchema.shape.securityWord }}
          >
            {(field) => {
              const error = resolveFieldError(field.state.meta.errors)

              return (
                <div className="flex flex-col gap-2">
                  <Field label={t('form.securityWord')} htmlFor={field.name} error={error}>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="new-password"
                      value={field.state.value}
                      placeholder={t('form.securityWordPlaceholder')}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={error ? true : undefined}
                    />
                  </Field>
                  <p className="text-xs text-ink-muted">{t('form.securityWordHint')}</p>
                </div>
              )
            }}
          </form.Field>
        </form>
      </div>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
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
              form={STAFF_USER_FORM_ID}
              size="default"
              loading={isSubmitting}
              className="min-w-36 sm:min-w-40"
            >
              {isSubmitting ? t('form.submitting') : t('form.submit')}
            </Button>
          </DialogFooter>
        )}
      </form.Subscribe>
    </>
  )
}
