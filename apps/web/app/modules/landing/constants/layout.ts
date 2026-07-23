/** Shared landing surface layout — keep section chrome on one scale. */
export const LANDING_SHELL = 'mx-auto max-w-7xl px-margin-mobile sm:px-8 lg:px-margin-desktop'

export const LANDING_SECTION_Y = 'py-[clamp(4rem,10vw,7.5rem)]'

export const LANDING_HEADING =
  'font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-balance'

/** Primary ink CTA — brand color lives in photography, not chrome. */
export const LANDING_CTA_PRIMARY =
  'min-h-11 rounded-lg bg-on-surface text-on-primary-fixed hover:bg-on-surface/90'

export const LANDING_CTA_GHOST_ON_MEDIA =
  'min-h-11 rounded-lg border-white/25 bg-transparent text-on-surface hover:bg-white/10'

export const LANDING_FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink'
