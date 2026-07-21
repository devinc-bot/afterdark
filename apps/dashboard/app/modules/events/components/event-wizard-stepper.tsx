import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { cn } from '@afterdark/ui'
import { EVENT_WIZARD_STEP, type EventWizardStep } from '~/modules/events/utils/event-wizard.types'

type StepStatus = 'complete' | 'current' | 'upcoming'

type StepDefinition = {
  step: EventWizardStep
  labelKey: string
}

const WIZARD_STEPS: StepDefinition[] = [
  { step: EVENT_WIZARD_STEP.LOCATION, labelKey: 'wizard.stepLocationShort' },
  { step: EVENT_WIZARD_STEP.DETAILS, labelKey: 'wizard.stepDetailsShort' },
]

const STATUS_LABEL_KEY: Record<StepStatus, string> = {
  complete: 'wizard.stepStatusComplete',
  current: 'wizard.stepStatusCurrent',
  upcoming: 'wizard.stepStatusUpcoming',
}

type EventWizardStepperProps = {
  currentStep: EventWizardStep
  onStepSelect?: (step: EventWizardStep) => void
  className?: string
}

export function EventWizardStepper({
  currentStep,
  onStepSelect,
  className,
}: EventWizardStepperProps) {
  const { t } = useTranslation('events')

  return (
    <nav aria-label={t('wizard.stepperLabel')} className={cn('max-w-md', className)}>
      <ol className="flex items-center">
        {WIZARD_STEPS.map((definition, index) => {
          const status: StepStatus =
            definition.step < currentStep
              ? 'complete'
              : definition.step === currentStep
                ? 'current'
                : 'upcoming'
          const isLast = index === WIZARD_STEPS.length - 1
          const onSelect =
            status === 'complete' && onStepSelect ? () => onStepSelect(definition.step) : undefined

          return (
            <li
              key={definition.step}
              className={cn('flex items-center gap-2.5', !isLast && 'flex-1')}
            >
              <StepMarker
                index={index}
                status={status}
                label={t(definition.labelKey)}
                statusLabel={t(STATUS_LABEL_KEY[status])}
                onSelect={onSelect}
              />
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-px flex-1 rounded-full transition-colors duration-(--duration-fast) ease-(--ease-emphasized) motion-reduce:transition-none',
                    status === 'complete' ? 'bg-primary/50' : 'bg-hairline'
                  )}
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

type StepMarkerProps = {
  index: number
  status: StepStatus
  label: string
  statusLabel: string
  onSelect?: () => void
}

function StepMarker({ index, status, label, statusLabel, onSelect }: StepMarkerProps) {
  const dot = (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-full border font-label text-sm font-semibold transition-colors duration-(--duration-fast) ease-(--ease-emphasized) motion-reduce:transition-none',
        status === 'current' && 'border-transparent bg-primary text-on-primary',
        status === 'complete' && 'border-primary/40 bg-primary/15 text-primary',
        status === 'upcoming' && 'border-hairline bg-surface-container-low text-ink-muted-soft'
      )}
    >
      {status === 'complete' ? <Check className="size-4" /> : index + 1}
    </span>
  )

  const srStatus = <span className="sr-only">, {statusLabel}</span>

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="group -m-1.5 flex items-center gap-2.5 rounded-lg p-1.5 transition-colors duration-(--duration-fast) ease-(--ease-emphasized) hover:bg-surface-container-low motion-reduce:transition-none"
      >
        {dot}
        <span className="font-heading text-base font-medium text-ink transition-colors duration-(--duration-fast) ease-(--ease-emphasized) group-hover:text-primary motion-reduce:transition-none">
          {label}
          {srStatus}
        </span>
      </button>
    )
  }

  return (
    <span
      className="flex items-center gap-2.5"
      aria-current={status === 'current' ? 'step' : undefined}
    >
      {dot}
      <span
        className={cn(
          'font-heading text-base transition-colors duration-(--duration-fast) ease-(--ease-emphasized) motion-reduce:transition-none',
          status === 'current' ? 'font-semibold text-ink' : 'font-medium text-ink-muted-soft'
        )}
      >
        {label}
        {srStatus}
      </span>
    </span>
  )
}
