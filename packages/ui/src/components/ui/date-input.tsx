import * as React from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Input } from './input.tsx'

export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** BCP 47 locale for the visible value. Defaults to es-AR (product language). */
  locale?: string
}

const DEFAULT_LOCALE = 'es-AR'

function formatIsoDateForLocale(iso: string, locale: string): string {
  if (!iso) {
    return ''
  }

  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return iso
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function placeholderForLocale(locale: string): string {
  const yearToken = locale.toLowerCase().startsWith('es') ? 'aaaa' : 'yyyy'
  const parts = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(new Date(2000, 11, 31))

  return parts
    .map((part) => {
      if (part.type === 'day') return 'dd'
      if (part.type === 'month') return 'mm'
      if (part.type === 'year') return yearToken
      return part.value
    })
    .join('')
}

function openNativeDatePicker(input: HTMLInputElement | null) {
  if (!input || input.disabled || input.readOnly) {
    return
  }

  try {
    if (typeof input.showPicker === 'function') {
      void input.showPicker()
      return
    }
  } catch {
    // showPicker can throw if not triggered by a user gesture or unsupported.
  }

  input.focus()
  input.click()
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      className,
      locale = DEFAULT_LOCALE,
      value,
      defaultValue,
      placeholder,
      id,
      disabled,
      readOnly,
      onChange,
      onBlur,
      onFocus,
      name,
      required,
      min,
      max,
      'aria-invalid': ariaInvalid,
      'aria-describedby': ariaDescribedBy,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const dateRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => dateRef.current as HTMLInputElement)

    const isControlled = value !== undefined
    const [uncontrolledValue, setUncontrolledValue] = React.useState(() =>
      typeof defaultValue === 'string' ? defaultValue : ''
    )
    const isoValue = isControlled ? String(value ?? '') : uncontrolledValue
    const displayValue = formatIsoDateForLocale(isoValue, locale)
    const resolvedPlaceholder = placeholder ?? placeholderForLocale(locale)

    const handleOpenPicker = () => {
      openNativeDatePicker(dateRef.current)
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setUncontrolledValue(event.target.value)
      }
      onChange?.(event)
    }

    return (
      <div className="relative w-full">
        <Input
          type="text"
          id={id}
          value={displayValue}
          placeholder={resolvedPlaceholder}
          disabled={disabled}
          readOnly
          inputMode="none"
          autoComplete="off"
          aria-label={ariaLabel}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          aria-haspopup="dialog"
          className={cn('cursor-pointer pr-12 scheme-dark', className)}
          onClick={handleOpenPicker}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleOpenPicker()
            }
          }}
        />
        <input
          {...props}
          ref={dateRef}
          type="date"
          name={name}
          value={isControlled ? value : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          min={min}
          max={max}
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || readOnly}
          aria-hidden
          className="absolute top-0 right-0 flex h-full w-12 items-center justify-center text-ink disabled:opacity-60"
          onClick={handleOpenPicker}
        >
          <Calendar strokeWidth={2} className="size-6" />
        </button>
      </div>
    )
  }
)
DateInput.displayName = 'DateInput'

export { DateInput }
