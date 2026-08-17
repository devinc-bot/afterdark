'use client'

import * as React from 'react'
import { CalendarIcon, Clock2Icon } from 'lucide-react'
import { enUS, es } from 'react-day-picker/locale'
import { Calendar } from './calendar'
import { InputGroup, InputGroupAddon, InputGroupInput } from './input-group'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

type CalendarDateTimeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange'
> & {
  value: string
  onValueChange: (value: string) => void
  locale?: 'en' | 'es'
  timeLabel: string
}

function parseDateTime(value: string): Date | undefined {
  if (!value) return undefined

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function formatDateTimeValue(date: Date): string {
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatDisplayValue(value: string, locale: 'en' | 'es'): string {
  const date = parseDateTime(value)
  if (!date) return ''

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function getTimeValue(date: Date | undefined): string {
  if (!date) return ''

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function isCompleteTimeValue(value: string): boolean {
  return /^\d{2}:\d{2}$/.test(value)
}

function CalendarDateTimeInput({
  value,
  onValueChange,
  locale = 'es',
  timeLabel,
  id,
  name,
  onBlur,
  disabled,
  ...props
}: CalendarDateTimeInputProps) {
  const [open, setOpen] = React.useState(false)
  const selectedDate = parseDateTime(value)
  const [timeDraft, setTimeDraft] = React.useState(getTimeValue(selectedDate))
  const isInvalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true'

  React.useEffect(() => {
    if (open) {
      setTimeDraft(getTimeValue(parseDateTime(value)))
    }
  }, [open, value])

  function updateDate(
    nextDate: Date,
    time = selectedDate ? `${selectedDate.getHours()}:${selectedDate.getMinutes()}` : '00:00'
  ) {
    const [hours, minutes] = time.split(':').map(Number)
    nextDate.setHours(hours, minutes, 0, 0)
    onValueChange(formatDateTimeValue(nextDate))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <InputGroup
          aria-invalid={isInvalid || undefined}
          data-disabled={disabled || undefined}
          className="cursor-pointer"
        >
          <InputGroupInput
            {...props}
            id={id}
            name={name}
            value={formatDisplayValue(value, locale)}
            readOnly
            disabled={disabled}
            onBlur={onBlur}
            onClick={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setOpen(true)
              }
            }}
          />
          <InputGroupAddon>
            <CalendarIcon />
          </InputGroupAddon>
        </InputGroup>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          defaultMonth={selectedDate}
          fixedWeeks
          onSelect={(date) => {
            if (date) updateDate(date)
          }}
          locale={locale === 'es' ? es : enUS}
        />
        <div className="border-t border-hairline px-3 py-3">
          <label
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-label-xs text-ink-muted"
            htmlFor={`${id}-time`}
          >
            <Clock2Icon className="size-4" />
            {timeLabel}
          </label>
          <InputGroup className="mt-2">
            <InputGroupInput
              id={`${id}-time`}
              type="time"
              step="60"
              value={timeDraft}
              disabled={!selectedDate || disabled}
              onChange={(event) => {
                const nextTime = event.target.value
                setTimeDraft(nextTime)

                if (selectedDate && isCompleteTimeValue(nextTime)) {
                  updateDate(new Date(selectedDate), nextTime)
                }
              }}
              onBlur={() => {
                if (!isCompleteTimeValue(timeDraft)) {
                  setTimeDraft(getTimeValue(selectedDate))
                }
              }}
            />
          </InputGroup>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { CalendarDateTimeInput, type CalendarDateTimeInputProps }
