import { useForm } from '@tanstack/react-form'
import { CLUB_STATUS } from '@afterdark/types'
import { createClubSchema, clubStatusSchema, type CreateClubInput } from '@afterdark/validators'
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  useCreateClub,
  useUpdateClub,
} from '~/modules/club-management/mutation/use-club-management-mutations'

export const CLUB_FORM_MODE = {
  CREATE: 'create',
  EDIT: 'edit',
} as const

export type ClubFormMode = (typeof CLUB_FORM_MODE)[keyof typeof CLUB_FORM_MODE]

const CLUB_DIALOG_FORM_ID = 'club-dialog-form'

const EMPTY_CLUB_FORM_VALUES: CreateClubInput = {
  name: '',
  address: '',
  capacity: '',
  description: '',
  status: CLUB_STATUS.ACTIVE,
  state: '',
  street_number: '',
  city: '',
}

const CLUB_STATUS_OPTIONS = [
  { value: CLUB_STATUS.ACTIVE, label: 'Activo' },
  { value: CLUB_STATUS.INACTIVE, label: 'Inactivo' },
] as const

const fieldLabelClassName =
  'font-label text-xs font-semibold uppercase tracking-label-xs text-ink-muted'

const fieldErrorClassName =
  'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40'

function fieldErrorMessage(errors: ReadonlyArray<unknown>): string | null {
  const [first] = errors
  if (!first) return null
  if (typeof first === 'string') return first
  if (typeof first === 'object' && 'message' in first) {
    return String((first as { message: unknown }).message)
  }
  return null
}

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
        className={error ? fieldErrorClassName : undefined}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-error">
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
        <h3 id={headingId} className="font-heading text-sm font-semibold text-ink">
          {title}
        </h3>
        {description ? <p className="text-sm text-ink-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

type ClubDialogFormProps = {
  mode: ClubFormMode
  open: boolean
  onOpenChange: (open: boolean) => void
  clubDocumentId?: string
  defaultValues?: Partial<CreateClubInput>
  isSubmitting?: boolean
  formKey?: string
}

function ClubDialogFormInner({
  mode,
  clubDocumentId,
  defaultValues,
  isSubmitting = false,
  onOpenChange,
}: Pick<
  ClubDialogFormProps,
  'mode' | 'clubDocumentId' | 'defaultValues' | 'isSubmitting' | 'onOpenChange'
>) {
  const isCreate = mode === CLUB_FORM_MODE.CREATE
  const createClubMutation = useCreateClub()
  const updateClubMutation = useUpdateClub()

  const form = useForm({
    defaultValues: { ...EMPTY_CLUB_FORM_VALUES, ...defaultValues },
    onSubmit: async ({ value }) => {
      if (isCreate) {
        try {
          await createClubMutation.mutateAsync(value)
          toast.success('Club registrado correctamente')
          onOpenChange(false)
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : 'No pudimos registrar el club. Intentá de nuevo.'
          )
        }
        return
      }

      if (!clubDocumentId) {
        toast.error('No pudimos identificar el club a actualizar.')
        return
      }

      try {
        await updateClubMutation.mutateAsync({ documentId: clubDocumentId, input: value })
        toast.success('Club actualizado correctamente')
        onOpenChange(false)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'No pudimos actualizar el club. Intentá de nuevo.'
        )
      }
    },
  })

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <form
          id={CLUB_DIALOG_FORM_ID}
          noValidate
          className="flex flex-col gap-8 px-8 py-6"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <FormSection
            title="Información general"
            description="Datos básicos del club que verán los usuarios en la plataforma."
          >
            <form.Field name="name" validators={{ onSubmit: createClubSchema.shape.name }}>
              {(field) => (
                <ClubFormField
                  id={field.name}
                  label="Nombre del club"
                  placeholder="Club Neón"
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
                  label="Capacidad"
                  placeholder="500"
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
                      Estado del club
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
                        className={error ? fieldErrorClassName : undefined}
                      >
                        <SelectValue placeholder="Seleccioná un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLUB_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {error ? (
                      <p id={`${field.name}-error`} role="alert" className="text-xs text-error">
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
                      Información adicional
                    </Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      placeholder="Ambiente, reglas de acceso, dress code…"
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      error={error ?? undefined}
                    />
                  </div>
                )
              }}
            </form.Field>
          </FormSection>

          <FormSection
            title="Ubicación"
            description="Dirección física del local para operaciones y referencias internas."
          >
            <form.Field name="address" validators={{ onSubmit: createClubSchema.shape.address }}>
              {(field) => (
                <ClubFormField
                  id={field.name}
                  label="Dirección"
                  placeholder="Calle Principal"
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
                    label="Número de calle"
                    placeholder="123"
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
                    label="Ciudad"
                    placeholder="Madrid"
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
                  label="Provincia"
                  placeholder="Comunidad de Madrid"
                  value={field.state.value}
                  error={fieldErrorMessage(field.state.meta.errors)}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                />
              )}
            </form.Field>
          </FormSection>
        </form>
      </div>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isFormSubmitting) => {
          const pending =
            isSubmitting ||
            isFormSubmitting ||
            createClubMutation.isPending ||
            updateClubMutation.isPending

          return (
            <DialogFooter className="mx-0 mb-0 mt-0 shrink-0 flex-col gap-3 px-6 py-6 sm:flex-row sm:justify-end sm:px-8">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  disabled={pending}
                  className="min-w-36 sm:min-w-40"
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                form={CLUB_DIALOG_FORM_ID}
                size="default"
                loading={pending}
                className="min-w-36 sm:min-w-40"
              >
                {pending
                  ? isCreate
                    ? 'Registrando…'
                    : 'Actualizando…'
                  : isCreate
                    ? 'Registrar club'
                    : 'Actualizar club'}
              </Button>
            </DialogFooter>
          )
        }}
      </form.Subscribe>
    </>
  )
}

export function ClubDialogForm({
  mode,
  open,
  onOpenChange,
  clubDocumentId,
  defaultValues,
  isSubmitting = false,
  formKey = 'create',
}: ClubDialogFormProps) {
  const isCreate = mode === CLUB_FORM_MODE.CREATE

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90dvh,48rem)] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-hairline bg-surface-container-high px-8 pb-6 pt-8">
          <DialogTitle>{isCreate ? 'Añadir nuevo club' : 'Editar club'}</DialogTitle>
          <DialogDescription>
            {isCreate
              ? 'Completá los datos para registrar un club en la plataforma.'
              : 'Actualizá la información del club. Los cambios se reflejan de inmediato.'}
          </DialogDescription>
        </DialogHeader>

        <ClubDialogFormInner
          key={formKey}
          mode={mode}
          clubDocumentId={clubDocumentId}
          defaultValues={defaultValues}
          isSubmitting={isSubmitting}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  )
}
