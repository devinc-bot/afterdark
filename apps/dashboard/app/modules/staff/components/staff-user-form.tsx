import { useForm } from '@tanstack/react-form'
import { USER_ROLE, STAFF_STATUS } from '@afterdark/types'
import { createStaffInvitationSchema, type CreateStaffInvitationInput } from '@afterdark/validators'
import {
  Button,
  DialogClose,
  DialogFooter,
  Field,
  Input,
  SelectField,
  SelectItem,
  toast,
} from '@afterdark/ui'
import {
  STAFF_CLUB_OPTIONS,
  getStaffClubLabel,
} from '~/modules/staff/constants/staff-clubs.constants'
import { STAFF_COPY } from '~/modules/staff/constants/staff.copy'
import {
  STAFF_USER_AVATAR_TONE,
  type StaffUserRecord,
} from '~/modules/staff/types/staff-user-record'
import {
  createStaffInvitation,
  type StaffInvitation,
} from '~/modules/staff/utils/staff-invitation.utils'
import { getStaffUserDisplayNameFromEmail } from '~/modules/staff/utils/staff-user.utils'

const STAFF_USER_FORM_ID = 'staff-user-form'

const EMPTY_STAFF_INVITATION_FORM_VALUES: CreateStaffInvitationInput = {
  email: '',
  clubId: '',
  securityWord: '',
}

function fieldErrorMessage(errors: ReadonlyArray<unknown>): string | null {
  const [first] = errors
  if (!first) return null
  if (typeof first === 'string') return first
  if (typeof first === 'object' && 'message' in first) {
    return String((first as { message: unknown }).message)
  }
  return null
}

export type StaffInvitationResult = {
  record: StaffUserRecord
  invitation: StaffInvitation
}

type StaffUserFormProps = {
  onInvite: (result: StaffInvitationResult) => void
}

export function StaffUserForm({ onInvite }: StaffUserFormProps) {
  const form = useForm({
    defaultValues: EMPTY_STAFF_INVITATION_FORM_VALUES,
    validators: {
      onSubmit: createStaffInvitationSchema,
    },
    onSubmit: async ({ value }) => {
      const invitation = await createStaffInvitation(value, window.location.origin)
      if (!invitation) {
        toast.error(STAFF_COPY.form.error)
        return
      }

      const record: StaffUserRecord = {
        id: crypto.randomUUID(),
        name: getStaffUserDisplayNameFromEmail(value.email),
        email: value.email,
        clubId: value.clubId,
        clubName: getStaffClubLabel(value.clubId),
        role: USER_ROLE.STAFF,
        lastActiveLabel: STAFF_COPY.invitation.pending,
        lastActiveAt: Date.now(),
        status: STAFF_STATUS.PENDING,
        avatarClassName: STAFF_USER_AVATAR_TONE.neutral,
      }

      onInvite({ record, invitation })
      toast.success(STAFF_COPY.form.success)
      form.reset()
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
                <Field label={STAFF_COPY.form.email} htmlFor={field.name} error={error}>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    value={field.state.value}
                    placeholder={STAFF_COPY.form.emailPlaceholder}
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

              return (
                <SelectField
                  label={STAFF_COPY.form.club}
                  value={field.state.value || undefined}
                  onValueChange={(value) => field.handleChange(value)}
                  placeholder={STAFF_COPY.form.clubPlaceholder}
                  error={error ?? undefined}
                >
                  {STAFF_CLUB_OPTIONS.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
                      {club.label}
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
                  <Field label={STAFF_COPY.form.securityWord} htmlFor={field.name} error={error}>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="new-password"
                      value={field.state.value}
                      placeholder={STAFF_COPY.form.securityWordPlaceholder}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={error ? true : undefined}
                    />
                  </Field>
                  <p className="text-xs text-ink-muted">{STAFF_COPY.form.securityWordHint}</p>
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
                {STAFF_COPY.form.cancel}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form={STAFF_USER_FORM_ID}
              size="default"
              loading={isSubmitting}
              className="min-w-36 sm:min-w-40"
            >
              {isSubmitting ? STAFF_COPY.form.submitting : STAFF_COPY.form.submit}
            </Button>
          </DialogFooter>
        )}
      </form.Subscribe>
    </>
  )
}
