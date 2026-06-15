import { useForm } from '@tanstack/react-form'
import { createClubSchema, type CreateClubInput } from '@afterdark/validators'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from '@afterdark/ui'

export const CLUB_FORM_MODE = {
  CREATE: 'create',
  EDIT: 'edit',
} as const

export type ClubFormMode = (typeof CLUB_FORM_MODE)[keyof typeof CLUB_FORM_MODE]

const EMPTY_CLUB_FORM_VALUES: CreateClubInput = {
  name: '',
  address: '',
  capacity: '',
  description: '',
  state: '',
  street_number: '',
  city: '',
}

const fieldLabelClassName =
  'font-label text-xs font-semibold uppercase tracking-label-xs text-ink-muted'

function fieldErrorMessage(errors: ReadonlyArray<unknown>): string | null {
  const [first] = errors
  if (!first) return null
  if (typeof first === 'string') return first
  if (typeof first === 'object' && 'message' in first) {
    return String((first as { message: unknown }).message)
  }
  return null
}

type ClubFormFieldProps = {
  id: string
  label: string
  placeholder?: string
  value: string
  error: string | null
  onBlur: () => void
  onChange: (value: string) => void
}

function sanitizeNonNegativeDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function ClubNumericFormField({
  id,
  label,
  placeholder,
  value,
  error,
  onBlur,
  onChange,
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
        inputMode="numeric"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onBlur={onBlur}
        onChange={(event) => onChange(sanitizeNonNegativeDigits(event.target.value))}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={
          error
            ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40'
            : undefined
        }
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-error">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function ClubFormField({
  id,
  label,
  placeholder,
  value,
  error,
  onBlur,
  onChange,
}: ClubFormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className={fieldLabelClassName}>
        {label}
      </Label>
      <Input
        id={id}
        name={id}
        value={value}
        placeholder={placeholder}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={
          error
            ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40'
            : undefined
        }
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-error">
          {error}
        </p>
      ) : null}
    </div>
  )
}

type ClubDialogFormProps = {
  mode: ClubFormMode
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: Partial<CreateClubInput>
  onSubmit: (values: CreateClubInput) => void | Promise<void>
  isSubmitting?: boolean
  formKey?: string
}

function ClubDialogFormFields({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: Pick<ClubDialogFormProps, 'mode' | 'defaultValues' | 'onSubmit' | 'isSubmitting'>) {
  const isCreate = mode === CLUB_FORM_MODE.CREATE

  const form = useForm({
    defaultValues: { ...EMPTY_CLUB_FORM_VALUES, ...defaultValues },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-6 px-6 py-6"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field name="name" validators={{ onSubmit: createClubSchema.shape.name }}>
        {(field) => (
          <ClubFormField
            id={field.name}
            label="Nombre del club"
            placeholder="e.g. Neon Void"
            value={field.state.value}
            error={fieldErrorMessage(field.state.meta.errors)}
            onBlur={field.handleBlur}
            onChange={field.handleChange}
          />
        )}
      </form.Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        <form.Field name="capacity" validators={{ onSubmit: createClubSchema.shape.capacity }}>
          {(field) => (
            <ClubNumericFormField
              id={field.name}
              label="Capacidad"
              placeholder="500"
              value={field.state.value}
              error={fieldErrorMessage(field.state.meta.errors)}
              onBlur={field.handleBlur}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        <form.Field name="state" validators={{ onSubmit: createClubSchema.shape.state }}>
          {(field) => (
            <ClubFormField
              id={field.name}
              label="Estado"
              placeholder="Madrid"
              value={field.state.value}
              error={fieldErrorMessage(field.state.meta.errors)}
              onBlur={field.handleBlur}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
      </div>

      <form.Field
        name="street_number"
        validators={{ onSubmit: createClubSchema.shape.street_number }}
      >
        {(field) => (
          <ClubNumericFormField
            id={field.name}
            label="Número de calle"
            placeholder="123"
            value={field.state.value}
            error={fieldErrorMessage(field.state.meta.errors)}
            onBlur={field.handleBlur}
            onChange={field.handleChange}
          />
        )}
      </form.Field>

      <form.Field name="description" validators={{ onSubmit: createClubSchema.shape.description }}>
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
                placeholder="Describe la atmósfera y reglas del club…"
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                error={error ?? undefined}
              />
            </div>
          )
        }}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isFormSubmitting) => {
          const pending = isSubmitting || isFormSubmitting

          return (
            <Button
              type="submit"
              size="lg"
              loading={pending}
              className="w-full uppercase tracking-label-sm"
            >
              {pending
                ? isCreate
                  ? 'Registrando…'
                  : 'Actualizando…'
                : isCreate
                  ? 'Registrar club'
                  : 'Actualizar club'}
            </Button>
          )
        }}
      </form.Subscribe>
    </form>
  )
}

export function ClubDialogForm({
  mode,
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  formKey = 'create',
}: ClubDialogFormProps) {
  const isCreate = mode === CLUB_FORM_MODE.CREATE

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90dvh,48rem)] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-hairline bg-surface-container-high px-6 py-5">
          <DialogTitle>{isCreate ? 'Añadir Nuevo Club' : 'Editar Club'}</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <ClubDialogFormFields
            key={formKey}
            mode={mode}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
