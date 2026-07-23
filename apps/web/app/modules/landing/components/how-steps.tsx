import type { LucideIcon } from 'lucide-react'
import { CalendarCheck, Ticket, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@afterdark/ui'

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
        'mt-14 grid gap-0 border-t border-hairline/50 sm:grid-cols-2 lg:grid-cols-3 lg:divide-x lg:divide-hairline/50',
        className
      )}
    >
      {HOW_STEPS.map(({ id, Icon }) => (
        <li
          key={id}
          className="min-w-0 border-b border-hairline/50 py-10 last:border-b-0 lg:border-b-0 lg:px-8 lg:pt-10 lg:first:pl-0 lg:last:pr-0"
        >
          <div className="flex flex-col gap-5">
            <Icon
              className="size-8 text-on-surface-variant"
              strokeWidth={1.5}
              absoluteStrokeWidth
              aria-hidden
            />
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
