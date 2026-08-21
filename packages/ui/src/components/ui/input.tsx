import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const inputClassName = cn(
  'cn-gradient-border cn-gradient-border--field flex h-9 w-full rounded-app-sm px-4 text-sm text-ink',
  'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink',
  'placeholder:text-ink-muted-soft',
  'transition-[box-shadow,color,opacity] duration-(--duration-fast) ease-(--ease-emphasized)',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
  'read-only:cursor-default read-only:opacity-80 read-only:focus-visible:ring-outline-variant/40',
  'aria-invalid:focus-visible:ring-error/40',

  'disabled:cursor-not-allowed disabled:text-ink-muted-soft disabled:opacity-60',
  'motion-reduce:transition-none'
)

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, disabled, id, type, ...props }, ref) => {
    const { t } = useTranslation('common')
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const isPassword = type === 'password'
    const generatedId = useId()
    const inputId = isPassword ? (id ?? generatedId) : id

    const input = (
      <input
        id={inputId}
        type={isPassword && isPasswordVisible ? 'text' : type}
        disabled={disabled}
        className={cn(inputClassName, isPassword && 'pr-11', className)}
        ref={ref}
        {...props}
      />
    )

    if (!isPassword) {
      return input
    }

    const toggleLabel = isPasswordVisible
      ? t('passwordVisibility.hide')
      : t('passwordVisibility.show')

    return (
      <div className="relative min-w-0 w-full" data-slot="password-input">
        {input}
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-app-sm text-ink-muted transition-colors duration-(--duration-fast) ease-emphasized hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
          aria-label={toggleLabel}
          aria-controls={inputId}
          aria-pressed={isPasswordVisible}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setIsPasswordVisible((visible) => !visible)}
        >
          {isPasswordVisible ? (
            <EyeOff className="size-6" aria-hidden="true" />
          ) : (
            <Eye className="size-6" aria-hidden="true" />
          )}
        </button>
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
