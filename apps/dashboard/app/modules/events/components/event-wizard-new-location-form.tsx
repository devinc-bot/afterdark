import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { Crosshair } from 'lucide-react'
import { createLocationSchema } from '@afterdark/validators'
import {
  Button,
  cn,
  fieldErrorMessage,
  Input,
  Label,
  optionalFieldLabel,
  requiredFieldLabel,
  Textarea,
  toast,
} from '@afterdark/ui'
import { ImagesLocationForm } from '~/modules/locations/components/images-location-form'
import { LocationMap } from '~/modules/locations/components/location-map'
import {
  EMPTY_LOCATION_FORM_VALUES,
  type LocationFormValues,
} from '~/modules/locations/components/location-form'
import { fetchIpLocation } from '~/modules/locations/service/geo.service'
import { snapshotLocationFormValues } from '~/modules/locations/utils/location-form.formatter'

const fieldLabelClassName =
  'font-label text-xs font-semibold uppercase tracking-label-xs text-ink-muted'

const fieldErrorMessageClassName = 'text-xs text-error'

function sanitizeNonNegativeDigits(value: string): string {
  return value.replace(/\D/g, '')
}

type WizardFieldProps = {
  id: string
  label: string
  placeholder?: string
  value: string
  error: string | null
  onBlur: () => void
  onChange: (value: string) => void
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  sanitize?: (value: string) => string
  className?: string
}

function WizardField({
  id,
  label,
  placeholder,
  value,
  error,
  onBlur,
  onChange,
  inputMode,
  sanitize,
  className,
}: WizardFieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
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

export type EventWizardNewLocationFormHandle = {
  validate: () => Promise<boolean>
  getValues: () => LocationFormValues
}

type EventWizardNewLocationFormProps = {
  ref?: React.Ref<EventWizardNewLocationFormHandle>
  defaultValues?: LocationFormValues
  onDirtyChange?: (isDirty: boolean) => void
}

export function EventWizardNewLocationForm({
  ref,
  defaultValues = EMPTY_LOCATION_FORM_VALUES,
  onDirtyChange,
}: EventWizardNewLocationFormProps) {
  const { t } = useTranslation('locations')
  const { t: tCommon } = useTranslation('common')
  const { t: tEvents } = useTranslation('events')
  const initialSnapshotRef = useRef(snapshotLocationFormValues(defaultValues))
  const [mapViewToken, setMapViewToken] = useState(0)
  const [ipLocating, setIpLocating] = useState(false)
  const [ipLocateError, setIpLocateError] = useState<string | null>(null)

  const form = useForm({
    defaultValues,
  })

  useImperativeHandle(ref, () => ({
    getValues: () => form.state.values,
    validate: async () => {
      const values = form.state.values
      if (values.latitude === null || values.longitude === null) {
        toast.error(t('map.coordinatesRequired'))
        return false
      }

      const parsed = createLocationSchema.safeParse({
        name: values.name,
        capacity: values.capacity,
        description: values.description,
        address: values.address,
        street_number: values.street_number,
        city: values.city,
        state: values.state,
        latitude: values.latitude,
        longitude: values.longitude,
      })

      if (!parsed.success) {
        toast.error(tEvents('wizard.newLocationInvalid'))
        await form.validateAllFields('submit')
        return false
      }

      return true
    },
  }))

  const setCoordinatesFromMap = (coords: { latitude: number; longitude: number }) => {
    form.setFieldValue('latitude', coords.latitude)
    form.setFieldValue('longitude', coords.longitude)
  }

  const handleIpLocate = async () => {
    setIpLocateError(null)
    setIpLocating(true)
    try {
      const result = await fetchIpLocation()
      form.setFieldValue('latitude', result.latitude)
      form.setFieldValue('longitude', result.longitude)
      form.setFieldValue('city', result.city ?? '')
      form.setFieldValue('state', result.state ?? '')
      setMapViewToken((token) => token + 1)
    } catch {
      setIpLocateError(t('map.ipLocateError'))
    } finally {
      setIpLocating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form.Subscribe selector={(state) => state.values}>
        {(values) => (
          <WizardDirtyReporter
            values={values}
            initialSnapshot={initialSnapshotRef.current}
            onDirtyChange={onDirtyChange}
          />
        )}
      </form.Subscribe>

      <p className="text-sm text-ink-muted">{tEvents('wizard.newLocationHint')}</p>

      <form.Field name="name" validators={{ onSubmit: createLocationSchema.shape.name }}>
        {(field) => (
          <WizardField
            id={`wizard-${field.name}`}
            label={requiredFieldLabel(t('form.fields.name'))}
            placeholder={t('form.fields.namePlaceholder')}
            value={field.state.value}
            error={fieldErrorMessage(field.state.meta.errors)}
            onBlur={field.handleBlur}
            onChange={field.handleChange}
          />
        )}
      </form.Field>

      <form.Field name="capacity" validators={{ onSubmit: createLocationSchema.shape.capacity }}>
        {(field) => (
          <WizardField
            id={`wizard-${field.name}`}
            label={requiredFieldLabel(t('form.fields.capacity'))}
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

      <form.Field
        name="description"
        validators={{ onSubmit: createLocationSchema.shape.description }}
      >
        {(field) => {
          const error = fieldErrorMessage(field.state.meta.errors)

          return (
            <div className="flex flex-col gap-2">
              <Label htmlFor={`wizard-${field.name}`} className={fieldLabelClassName}>
                {requiredFieldLabel(t('form.fields.additionalInfo'))}
              </Label>
              <Textarea
                id={`wizard-${field.name}`}
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

      <form.Field name="city" validators={{ onSubmit: createLocationSchema.shape.city }}>
        {(field) => {
          const error = fieldErrorMessage(field.state.meta.errors) ?? ipLocateError

          return (
            <div className="flex flex-col gap-2">
              <Label htmlFor={`wizard-${field.name}`} className={fieldLabelClassName}>
                {requiredFieldLabel(t('form.fields.city'))}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`wizard-${field.name}`}
                  name={field.name}
                  type="text"
                  autoComplete="off"
                  value={field.state.value}
                  placeholder={t('form.fields.cityPlaceholder')}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    setIpLocateError(null)
                    field.handleChange(event.target.value)
                  }}
                  aria-invalid={error ? true : undefined}
                  className="min-w-0 flex-1"
                />
                <Button
                  type="button"
                  size="icon"
                  aria-label={t('map.ipLocate')}
                  title={t('map.ipLocate')}
                  disabled={ipLocating}
                  onClick={() => {
                    void handleIpLocate()
                  }}
                >
                  <Crosshair
                    className={`size-4 ${ipLocating ? 'animate-pulse' : ''}`}
                    aria-hidden
                  />
                </Button>
              </div>
              {ipLocating ? (
                <p className="text-xs text-ink-muted">{t('map.ipLocateLoading')}</p>
              ) : null}
              {error && !ipLocating ? (
                <p role="alert" className={fieldErrorMessageClassName}>
                  {error}
                </p>
              ) : null}
            </div>
          )
        }}
      </form.Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <form.Field name="address" validators={{ onSubmit: createLocationSchema.shape.address }}>
          {(field) => (
            <WizardField
              id={`wizard-${field.name}`}
              label={requiredFieldLabel(t('form.fields.address'))}
              placeholder={t('form.fields.addressPlaceholder')}
              value={field.state.value}
              error={fieldErrorMessage(field.state.meta.errors)}
              onBlur={field.handleBlur}
              onChange={field.handleChange}
              className="col-span-2"
            />
          )}
        </form.Field>
        <form.Field
          name="street_number"
          validators={{ onSubmit: createLocationSchema.shape.street_number }}
        >
          {(field) => (
            <WizardField
              id={`wizard-${field.name}`}
              label={requiredFieldLabel(t('form.fields.streetNumber'))}
              placeholder={t('form.fields.streetNumberPlaceholder')}
              inputMode="numeric"
              sanitize={sanitizeNonNegativeDigits}
              value={field.state.value}
              error={fieldErrorMessage(field.state.meta.errors)}
              onBlur={field.handleBlur}
              onChange={field.handleChange}
              className="col-span-1"
            />
          )}
        </form.Field>
      </div>

      <form.Field name="state" validators={{ onSubmit: createLocationSchema.shape.state }}>
        {(field) => (
          <WizardField
            id={`wizard-${field.name}`}
            label={requiredFieldLabel(t('form.fields.state'))}
            placeholder={t('form.fields.statePlaceholder')}
            value={field.state.value}
            error={fieldErrorMessage(field.state.meta.errors)}
            onBlur={field.handleBlur}
            onChange={field.handleChange}
          />
        )}
      </form.Field>

      <form.Subscribe
        selector={(state) => ({
          latitude: state.values.latitude,
          longitude: state.values.longitude,
        })}
      >
        {(location) => (
          <div className="flex flex-col gap-2">
            <LocationMap
              latitude={location.latitude}
              longitude={location.longitude}
              viewToken={mapViewToken}
              onCoordinatesChange={setCoordinatesFromMap}
            />
          </div>
        )}
      </form.Subscribe>

      <div className="flex flex-col gap-2">
        <h3 className="font-heading text-sm font-semibold text-ink">
          {optionalFieldLabel(t('sections.imagesTitle'), tCommon('optional'))}
        </h3>
        <p className="text-sm text-ink-muted">{t('sections.imagesDescription')}</p>
        <form.Field name="existingImages">
          {(existingField) => (
            <form.Field name="locationImg">
              {(newField) => (
                <ImagesLocationForm
                  existingImages={existingField.state.value}
                  onExistingImagesChange={existingField.handleChange}
                  newImages={newField.state.value}
                  onNewImagesChange={newField.handleChange}
                />
              )}
            </form.Field>
          )}
        </form.Field>
      </div>
    </div>
  )
}

function WizardDirtyReporter({
  values,
  initialSnapshot,
  onDirtyChange,
}: {
  values: LocationFormValues
  initialSnapshot: string
  onDirtyChange?: (isDirty: boolean) => void
}) {
  useEffect(() => {
    const isDirty = snapshotLocationFormValues(values) !== initialSnapshot
    onDirtyChange?.(isDirty)
  }, [values, initialSnapshot, onDirtyChange])

  return null
}
