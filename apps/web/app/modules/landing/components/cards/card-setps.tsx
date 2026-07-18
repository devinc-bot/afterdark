import type { LucideIcon } from 'lucide-react'
import { CalendarCheck, Ticket, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardDescription, CardHeader, CardTitle, cn } from '@afterdark/ui'

const HOW_STEPS = [
  { id: '1', Icon: UserRound },
  { id: '2', Icon: CalendarCheck },
  { id: '3', Icon: Ticket },
] as const satisfies ReadonlyArray<{ id: string; Icon: LucideIcon }>

type CardStepsProps = {
  className?: string
}

export function CardSteps({ className }: CardStepsProps) {
  const { t } = useTranslation('landing')

  return (
    <ol className={cn('mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {HOW_STEPS.map(({ id, Icon }) => (
        <li key={id} className="min-w-0">
          <Card
            as="article"
            className={cn(
              'h-full rounded-3xl border-hairline/50 bg-surface-container-low p-0 shadow-none',
              'transition-[border-color,transform,background-color] duration-(--duration-fast) ease-emphasized',
              'hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface-container',
              'motion-reduce:transition-none motion-reduce:hover:translate-y-0'
            )}
          >
            <CardHeader className="gap-5 space-y-0 p-8">
              <div
                className="flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary"
                aria-hidden
              >
                <Icon className="size-8" strokeWidth={1.75} absoluteStrokeWidth />
              </div>
              <div className="flex flex-col gap-3">
                <CardTitle className="font-display text-xl font-semibold tracking-tight text-balance text-on-surface">
                  {t(`how.steps.${id}.title`)}
                </CardTitle>
                <CardDescription className="max-w-[36ch] text-base leading-relaxed text-pretty text-on-surface-variant">
                  {t(`how.steps.${id}.body`)}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </li>
      ))}
    </ol>
  )
}
