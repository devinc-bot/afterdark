import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { googleOauthErrorMessageKey } from '@repo/common'
import { LEGAL_DOCUMENT_TYPE, type PublicLegalDocumentResponse } from '@repo/types'
import { registerFormFieldsSchema, registerFormSchema } from '@repo/validators'
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Field,
  fieldErrorMessage,
  RICH_EDITOR_HTML_CLASS_NAME,
  cn,
  richEditorJsonToHtml,
} from '@repo/ui'
import { QUERY_KEYS } from '../../common/constants/query-keys'
import { WEB_ROUTES } from '../../common/constants/routes'
import { getPublishedLegalDocumentByType } from '../../legal-documents/services/legal-documents.service'
import { useRequestRegister } from '../mutations/use-auth-mutations'
import { AuthInput } from './auth-input'
import { AuthMethodSeparator, GoogleContinueButton } from './google-continue-button'

const REGISTER_LEGAL_CHECKBOX_ID = {
  TERMS: 'register-legal-terms',
  PRIVACY: 'register-legal-privacy',
} as const

const LEGAL_NOTICE = {
  REQUIRED: 'required',
  UNAVAILABLE: 'unavailable',
} as const

const LEGAL_NOTICE_ID = 'register-legal-notice'

type LegalNotice = (typeof LEGAL_NOTICE)[keyof typeof LEGAL_NOTICE]

function PublishedLegalDocumentDialog({
  document,
  onClose,
}: {
  document: PublicLegalDocumentResponse | null
  onClose: () => void
}) {
  const { t } = useTranslation('auth')
  const html = document ? richEditorJsonToHtml(document.content) : ''

  return (
    <Dialog
      open={document !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent
        size="lg"
        closeLabel={t('register.legal.close')}
        className="flex max-h-[min(90vh,40rem)] flex-col overflow-hidden"
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{document?.title ?? ''}</DialogTitle>
          <DialogDescription className="sr-only">{t('register.legal.dialogDescription')}</DialogDescription>
        </DialogHeader>
        <div
          className={cn('min-h-0 overflow-y-auto', RICH_EDITOR_HTML_CLASS_NAME)}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </DialogContent>
    </Dialog>
  )
}

function LegalAcceptanceField({
  id,
  label,
  openLabel,
  checked,
  invalid,
  describedBy,
  onCheckedChange,
  onOpen,
}: {
  id: string
  label: string
  openLabel: string
  checked: boolean
  invalid: boolean
  describedBy?: string
  onCheckedChange: (checked: boolean) => void
  onOpen: () => void
}) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox
        id={id}
        checked={checked}
        className="shrink-0"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
        <label htmlFor={id} className="cursor-pointer py-2 text-sm leading-snug text-on-surface">
          {label}
        </label>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto min-w-0 whitespace-normal px-0 py-2 text-left leading-snug text-on-surface underline"
          onClick={onOpen}
        >
          {openLabel}
        </Button>
      </div>
    </div>
  )
}

export function RegisterForm() {
  const { t } = useTranslation('auth')
  const { error: oauthError } = useSearch({ from: '/register' })
  const register = useRequestRegister()
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [legalNotice, setLegalNotice] = useState<LegalNotice | null>(null)
  const [openDocument, setOpenDocument] = useState<PublicLegalDocumentResponse | null>(null)

  const termsQuery = useQuery({
    queryKey: QUERY_KEYS.publishedLegalDocument(LEGAL_DOCUMENT_TYPE.TERMS_WEB),
    queryFn: () => getPublishedLegalDocumentByType(LEGAL_DOCUMENT_TYPE.TERMS_WEB),
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
  const privacyQuery = useQuery({
    queryKey: QUERY_KEYS.publishedLegalDocument(LEGAL_DOCUMENT_TYPE.PRIVACY_WEB),
    queryFn: () => getPublishedLegalDocumentByType(LEGAL_DOCUMENT_TYPE.PRIVACY_WEB),
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })

  const canAcceptLegal = termsQuery.isSuccess && privacyQuery.isSuccess
  const accepted = termsAccepted && privacyAccepted
  const legalQueriesSettled = !termsQuery.isPending && !privacyQuery.isPending
  const legalUnavailable = legalQueriesSettled && !canAcceptLegal
  const visibleLegalNotice = legalUnavailable ? LEGAL_NOTICE.UNAVAILABLE : legalNotice

  const form = useForm({
    defaultValues: { name: '', lastName: '', email: '', password: '', confirmPassword: '' },
    validators: {
      onSubmit: registerFormSchema,
    },
    onSubmit: async ({ value }) => {
      await register.mutateAsync({
        name: value.name,
        lastName: value.lastName,
        email: value.email,
        password: value.password,
      })
      setSubmittedEmail(value.email)
    },
  })

  const isBusy = register.isPending

  if (submittedEmail) {
    return (
      <div className="w-full">
        <h1 className="font-display text-3xl font-bold tracking-tight text-balance text-on-surface md:text-4xl">
          {t('register.checkEmail.title')}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
          {t('register.checkEmail.description', { email: submittedEmail })}
        </p>
        <Button asChild size="lg" className="mt-10 w-full">
          <Link to={WEB_ROUTES.login()}>{t('register.checkEmail.backToLogin')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <form
      noValidate
      className="w-full"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (!legalQueriesSettled) {
          return
        }
        if (!canAcceptLegal) {
          setLegalNotice(LEGAL_NOTICE.UNAVAILABLE)
          return
        }
        if (!accepted) {
          setLegalNotice(LEGAL_NOTICE.REQUIRED)
          return
        }
        setLegalNotice(null)
        void form.handleSubmit()
      }}
    >
      <h1 className="font-display text-3xl font-bold tracking-tight text-balance text-on-surface md:text-4xl">
        {t('register.title')}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
        {t('register.subtitle')}
      </p>

      <div className="mt-10 space-y-5">
        {oauthError ? (
          <p
            role="alert"
            className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error"
          >
            {t(googleOauthErrorMessageKey(oauthError))}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
          <form.Field
            name="name"
            validators={{
              onBlur: registerFormFieldsSchema.shape.name,
              onSubmit: registerFormFieldsSchema.shape.name,
            }}
          >
            {(field) => {
              const error = fieldErrorMessage(field.state.meta.errors)
              return (
                <Field label={t('register.name')} htmlFor={field.name} error={error}>
                  <AuthInput
                    id={field.name}
                    name={field.name}
                    type="text"
                    autoComplete="given-name"
                    placeholder={t('register.namePlaceholder')}
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
            name="lastName"
            validators={{
              onBlur: registerFormFieldsSchema.shape.lastName,
              onSubmit: registerFormFieldsSchema.shape.lastName,
            }}
          >
            {(field) => {
              const error = fieldErrorMessage(field.state.meta.errors)
              return (
                <Field label={t('register.lastName')} htmlFor={field.name} error={error}>
                  <AuthInput
                    id={field.name}
                    name={field.name}
                    type="text"
                    autoComplete="family-name"
                    placeholder={t('register.lastNamePlaceholder')}
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
          name="email"
          validators={{
            onBlur: registerFormFieldsSchema.shape.email,
            onSubmit: registerFormFieldsSchema.shape.email,
          }}
        >
          {(field) => {
            const error = fieldErrorMessage(field.state.meta.errors)
            return (
              <Field label={t('register.emailWeb')} htmlFor={field.name} error={error}>
                <AuthInput
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  placeholder={t('register.emailPlaceholderWeb')}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={error ? true : undefined}
                />
              </Field>
            )
          }}
        </form.Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
          <form.Field
            name="password"
            validators={{
              onBlur: registerFormFieldsSchema.shape.password,
              onSubmit: registerFormFieldsSchema.shape.password,
            }}
          >
            {(field) => {
              const error = fieldErrorMessage(field.state.meta.errors)
              return (
                <Field label={t('register.password')} htmlFor={field.name} error={error}>
                  <AuthInput
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="new-password"
                    placeholder={t('register.passwordPlaceholder')}
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
            name="confirmPassword"
            validators={{
              onBlur: registerFormFieldsSchema.shape.confirmPassword,
              onSubmit: registerFormFieldsSchema.shape.confirmPassword,
            }}
          >
            {(field) => {
              const error = fieldErrorMessage(field.state.meta.errors)
              return (
                <Field label={t('register.confirmPassword')} htmlFor={field.name} error={error}>
                  <AuthInput
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="new-password"
                    placeholder={t('register.confirmPasswordPlaceholder')}
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

        {canAcceptLegal ? (
          <fieldset className="space-y-3 border-0 p-0">
            <legend className="sr-only">{t('register.legal.legend')}</legend>
            <LegalAcceptanceField
              id={REGISTER_LEGAL_CHECKBOX_ID.TERMS}
              label={t('register.legal.terms')}
              openLabel={t('register.legal.termsOpen')}
              checked={termsAccepted}
              invalid={legalNotice === LEGAL_NOTICE.REQUIRED && !termsAccepted}
              describedBy={legalNotice === LEGAL_NOTICE.REQUIRED ? LEGAL_NOTICE_ID : undefined}
              onCheckedChange={setTermsAccepted}
              onOpen={() => setOpenDocument(termsQuery.data ?? null)}
            />
            <LegalAcceptanceField
              id={REGISTER_LEGAL_CHECKBOX_ID.PRIVACY}
              label={t('register.legal.privacy')}
              openLabel={t('register.legal.privacyOpen')}
              checked={privacyAccepted}
              invalid={legalNotice === LEGAL_NOTICE.REQUIRED && !privacyAccepted}
              describedBy={legalNotice === LEGAL_NOTICE.REQUIRED ? LEGAL_NOTICE_ID : undefined}
              onCheckedChange={setPrivacyAccepted}
              onOpen={() => setOpenDocument(privacyQuery.data ?? null)}
            />
          </fieldset>
        ) : null}

        <PublishedLegalDocumentDialog
          document={openDocument}
          onClose={() => setOpenDocument(null)}
        />

        {visibleLegalNotice ? (
          <div className="space-y-3">
            <p
              id={LEGAL_NOTICE_ID}
              role="alert"
              className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error"
            >
              {t(
                visibleLegalNotice === LEGAL_NOTICE.UNAVAILABLE
                  ? 'register.legal.unavailable'
                  : 'register.legal.required'
              )}
            </p>
            {legalUnavailable ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void termsQuery.refetch()
                  void privacyQuery.refetch()
                }}
              >
                {t('register.legal.retry')}
              </Button>
            ) : null}
          </div>
        ) : null}

        {register.isError ? (
          <p
            role="alert"
            className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error"
          >
            {register.error.message}
          </p>
        ) : null}

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => {
            const loading = isSubmitting || isBusy
            return (
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                {loading ? t('register.submitting') : t('register.submit')}
              </Button>
            )
          }}
        </form.Subscribe>

        <AuthMethodSeparator />
        <GoogleContinueButton
          disabled={!canAcceptLegal || !accepted}
          legalAccepted={accepted && canAcceptLegal}
        />
      </div>

      <hr className="mt-10 border-hairline" />

      <nav aria-label={t('register.otherOptions')} className="mt-6 flex justify-center text-sm">
        <Link
          to={WEB_ROUTES.login()}
          className="text-on-surface-variant underline underline-offset-4 transition-colors duration-150 hover:text-primary"
        >
          {t('register.alreadyHaveAccount')} {t('register.signIn')}
        </Link>
      </nav>
    </form>
  )
}
