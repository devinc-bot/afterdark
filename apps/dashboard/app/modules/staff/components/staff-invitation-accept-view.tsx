import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  acceptStaffInvitationSchema,
  verifyStaffInvitationSecurityWordSchema,
} from '@afterdark/validators'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  Field,
  fieldErrorMessage,
  Input,
  toast,
} from '@afterdark/ui'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import { getStaffClubLabel } from '~/modules/staff/constants/staff-clubs.constants'
import { STAFF_COPY } from '~/modules/staff/constants/staff.copy'
import type { StaffInvitationPayload } from '~/modules/staff/utils/staff-invitation.utils'
import {
  staffInvitationRequiresSecurityWord,
  verifyStaffInvitationSecurityWord,
} from '~/modules/staff/utils/staff-invitation.utils'

type StaffInvitationAcceptViewProps = {
  payload: StaffInvitationPayload
}

export function StaffInvitationAcceptView({ payload }: StaffInvitationAcceptViewProps) {
  const navigate = useNavigate()
  const copy = STAFF_COPY.invitation.accept
  const requiresSecurityWord = staffInvitationRequiresSecurityWord(payload)

  const form = useForm({
    defaultValues: { securityWord: '', password: '', confirmPassword: '' },
    onSubmit: async ({ value }) => {
      if (requiresSecurityWord) {
        const securityParsed = verifyStaffInvitationSecurityWordSchema.safeParse({
          securityWord: value.securityWord,
        })
        if (!securityParsed.success) return

        const isValidSecurityWord = await verifyStaffInvitationSecurityWord(
          payload,
          securityParsed.data.securityWord
        )
        if (!isValidSecurityWord) {
          toast.error(copy.securityWordWrong)
          return
        }
      }

      const parsed = acceptStaffInvitationSchema.safeParse(value)
      if (!parsed.success) return

      toast.success(copy.success)
      void navigate({ to: DASHBOARD_ROUTES.login(), replace: true })
    },
  })

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="px-6 py-5 sm:px-8">
        <Link
          to={DASHBOARD_ROUTES.login()}
          className="text-lg tracking-tight text-ink transition-colors duration-150 hover:text-primary"
        >
          Afterdark
        </Link>
      </header>

      <main className="grid flex-1 place-items-center px-6 py-12">
        <div className="motion-reduce:animate-none animate-fade-up w-full max-w-md">
          <Card variant="gradient">
            <CardHeader className="sm:p-8">
              <h1 className="text-balance font-heading text-2xl font-bold text-ink">
                {copy.title}
              </h1>
              <CardDescription className="text-pretty text-sm">{copy.description}</CardDescription>
            </CardHeader>

            <CardContent className="sm:px-8 sm:pb-8">
              <dl className="flex flex-wrap gap-5 rounded-lg bg-surface-container-high p-4 text-sm">
                <div>
                  <dt className="text-ink-muted">{copy.invitedAs}</dt>
                  <dd className="mt-1 font-medium text-ink">{payload.email}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">{copy.clubLabel}</dt>
                  <dd className="mt-1">
                    <Badge variant="outline" size="sm">
                      {getStaffClubLabel(payload.clubId)}
                    </Badge>
                  </dd>
                </div>
              </dl>

              <form
                noValidate
                className="mt-6 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  void form.handleSubmit()
                }}
              >
                {requiresSecurityWord ? (
                  <form.Field
                    name="securityWord"
                    validators={{
                      onSubmit: verifyStaffInvitationSecurityWordSchema.shape.securityWord,
                    }}
                  >
                    {(field) => {
                      const error = fieldErrorMessage(field.state.meta.errors)

                      return (
                        <Field label={copy.securityWord} htmlFor={field.name} error={error}>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="password"
                            autoComplete="off"
                            value={field.state.value}
                            placeholder={copy.securityWordPlaceholder}
                            onBlur={field.handleBlur}
                            onChange={(event) => field.handleChange(event.target.value)}
                            aria-invalid={error ? true : undefined}
                          />
                        </Field>
                      )
                    }}
                  </form.Field>
                ) : null}

                <form.Field
                  name="password"
                  validators={{ onSubmit: acceptStaffInvitationSchema.shape.password }}
                >
                  {(field) => {
                    const error = fieldErrorMessage(field.state.meta.errors)

                    return (
                      <Field label={copy.password} htmlFor={field.name} error={error}>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="password"
                          autoComplete="new-password"
                          value={field.state.value}
                          placeholder={copy.passwordPlaceholder}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          aria-invalid={error ? true : undefined}
                        />
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field
                  name="confirmPassword"
                  validators={{
                    onSubmit: ({ value, fieldApi }) => {
                      const password = fieldApi.form.getFieldValue('password')
                      const result = acceptStaffInvitationSchema.safeParse({
                        securityWord: fieldApi.form.getFieldValue('securityWord'),
                        password,
                        confirmPassword: value,
                      })
                      if (!result.success) {
                        return result.error.issues.map((issue) => issue.message)
                      }
                      return undefined
                    },
                  }}
                >
                  {(field) => {
                    const error = fieldErrorMessage(field.state.meta.errors)

                    return (
                      <Field label={copy.confirmPassword} htmlFor={field.name} error={error}>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="password"
                          autoComplete="new-password"
                          value={field.state.value}
                          placeholder={copy.confirmPasswordPlaceholder}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          aria-invalid={error ? true : undefined}
                        />
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Subscribe selector={(state) => state.isSubmitting}>
                  {(isSubmitting) => (
                    <Button type="submit" className="w-full" loading={isSubmitting}>
                      {isSubmitting ? copy.submitting : copy.submit}
                    </Button>
                  )}
                </form.Subscribe>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
