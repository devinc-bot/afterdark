import type { LucideIcon } from 'lucide-react'
import { CalendarCheck, Ticket, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@repo/ui'

const HOW_STEPS = [
  { id: '1', Icon: UserRound },
  { id: '2', Icon: CalendarCheck },
  { id: '3', Icon: Ticket },
] as const satisfies ReadonlyArray<{ id: string; Icon: LucideIcon }>

type HowStepsProps = {
  className?: string
}

export function HowSteps({ className }: HowStepsProps) {
  const { t } = useTranslation('landing')

  return (
    <ol
      className={cn(
        'mt-14 grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10',
        className
      )}
    >
      {HOW_STEPS.map(({ id, Icon }, index) => (
        <li key={id} className="min-w-0">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="font-label text-sm tabular-nums tracking-label-sm text-on-surface-variant">
                {String(index + 1).padStart(2, '0')}
              </span>
              <Icon
                className="size-7 text-on-surface-variant"
                strokeWidth={1.5}
                absoluteStrokeWidth
                aria-hidden
              />
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="font-display text-xl font-semibold tracking-tight text-balance text-on-surface">
                {t(`how.steps.${id}.title`)}
              </h3>
              <p className="max-w-[36ch] text-base leading-relaxed text-pretty text-on-surface-variant">
                {t(`how.steps.${id}.body`)}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
