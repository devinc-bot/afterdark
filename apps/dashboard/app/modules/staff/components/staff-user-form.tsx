import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { createStaffInvitationSchema, type CreateStaffInvitationInput } from '@afterdark/validators'
import {
  Button,
  DialogClose,
  DialogFooter,
  Field,
  fieldErrorMessage,
  Input,
  SelectField,
  SelectItem,
  toast,
} from '@afterdark/ui'
import type { TFunction } from 'i18next'
import { useClubs } from '~/modules/club-management/queries/use-club-management-queries'
import { postStaffInvitation } from '~/modules/staff/services/staff-invitations.service'

const STAFF_USER_FORM_ID = 'staff-user-form'

const EMPTY_STAFF_INVITATION_FORM_VALUES: CreateStaffInvitationInput = {
  email: '',
  clubId: '',
  securityWord: '',
}

type ClubSelectFieldDisplayInput = {
  isLoading: boolean
  isError: boolean
  clubCount: number
  fieldError: string | null
  t: TFunction<'staff'>
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

export type StaffInvitationSuccess = {
  url: string
  expiresAt: number
  hasSecurityWord: boolean
}

type StaffUserFormProps = {
  onInviteSuccess: (invitation: StaffInvitationSuccess) => void
}

export function StaffUserForm({ onInviteSuccess }: StaffUserFormProps) {
  const { t } = useTranslation('staff')
  const { data: clubs = [], isLoading: isClubsLoading, isError: isClubsError } = useClubs()

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
              const error = fieldErrorMessage(field.state.meta.errors)

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
            name="clubId"
            validators={{ onSubmit: createStaffInvitationSchema.shape.clubId }}
          >
            {(field) => {
              const error = fieldErrorMessage(field.state.meta.errors)
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

          <form.Field
            name="securityWord"
            validators={{ onSubmit: createStaffInvitationSchema.shape.securityWord }}
          >
            {(field) => {
              const error = fieldErrorMessage(field.state.meta.errors)

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
