import type { ReactNode } from 'react'
import { cn } from '@repo/ui'

export const PAGE_HEADER_HEADING =
  'font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-balance'

type PageHeaderProps = {
  title: ReactNode
  description: ReactNode
  className?: string
}

/** Title + description block for public app pages (discover, settings, …). */
export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'relative mb-8 max-w-prose border-b border-outline-variant/35 pb-6 sm:mb-10 sm:pb-8',
        className
      )}
    >
      <h1 className={PAGE_HEADER_HEADING}>{title}</h1>
      <p className="mt-2 max-w-[42ch] text-pretty font-body text-base leading-relaxed text-on-surface-variant sm:mt-3">
        {description}
      </p>
    </header>
  )
}
