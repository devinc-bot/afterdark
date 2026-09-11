import { useTranslation } from 'react-i18next'
import { cn } from '@repo/ui'
import { useRevealEntrance } from './reveal'

const HOW_STEP_IDS = ['1', '2', '3'] as const

type HowStepsProps = {
  className?: string
}

export function HowSteps({ className }: HowStepsProps) {
  const { t } = useTranslation('landing')
  const { ref, runEntrance } = useRevealEntrance()

  return (
    <ol
      ref={ref as never}
      className={cn(
        'mt-12 list-none divide-y divide-outline-variant/30 border-y border-outline-variant/30 p-0',
        className
      )}
    >
      {HOW_STEP_IDS.map((id, index) => (
        <li
          key={id}
          style={{ ['--i' as string]: index }}
          className={cn(
            'group motion-safe:transition-colors motion-safe:duration-(--duration-fast) motion-safe:ease-emphasized motion-safe:hover:bg-surface-container/30 motion-reduce:transition-none',
            runEntrance && 'animate-landing-stagger'
          )}
        >
          <div className="grid grid-cols-1 gap-4 px-1 py-8 sm:grid-cols-12 sm:items-start sm:gap-6 sm:px-3 sm:py-10">
            <span
              className="font-display text-5xl font-bold tabular-nums tracking-tight text-on-surface-variant/40 motion-safe:transition-colors motion-safe:duration-(--duration-fast) motion-safe:ease-emphasized motion-safe:group-hover:text-primary motion-reduce:transition-none sm:col-span-2 sm:text-6xl lg:text-7xl"
              aria-hidden
            >
              {String(index + 1).padStart(2, '0')}
            </span>

            <div className="flex min-w-0 flex-col gap-2 sm:col-span-4">
              <h3 className="font-display text-xl font-semibold tracking-tight text-balance text-on-surface motion-safe:transition-transform motion-safe:duration-(--duration-fast) motion-safe:ease-emphasized motion-safe:group-hover:translate-x-1 motion-reduce:transition-none sm:text-2xl">
                {t(`how.steps.${id}.title`)}
              </h3>
              <p className="font-label text-xs font-medium tracking-wider text-primary uppercase">
                {t(`how.steps.${id}.meta`)}
              </p>
            </div>

            <p className="max-w-[42ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:col-span-6 sm:pt-1 sm:text-lg">
              {t(`how.steps.${id}.body`)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
