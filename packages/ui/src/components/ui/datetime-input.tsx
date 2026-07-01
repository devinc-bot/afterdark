import * as React from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Input } from './input.tsx'

export interface DateTimeInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {}

const calendarPickerIndicatorClassName = [
  '[&::-webkit-calendar-picker-indicator]:absolute',
  '[&::-webkit-calendar-picker-indicator]:top-0',
  '[&::-webkit-calendar-picker-indicator]:right-0',
  '[&::-webkit-calendar-picker-indicator]:h-full',
  '[&::-webkit-calendar-picker-indicator]:w-12',
  '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
  '[&::-webkit-calendar-picker-indicator]:opacity-0',
].join(' ')

const DateTimeInput = React.forwardRef<HTMLInputElement, DateTimeInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <Input
          type="datetime-local"
          ref={ref}
          className={cn('pr-12 [color-scheme:dark]', calendarPickerIndicatorClassName, className)}
          {...props}
        />
        <Calendar
          aria-hidden="true"
          strokeWidth={2}
          className="pointer-events-none absolute top-1/2 right-2.5 size-6 -translate-y-1/2 text-ink"
        />
      </div>
    )
  }
)
DateTimeInput.displayName = 'DateTimeInput'

export { DateTimeInput }
