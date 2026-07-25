/** Shared landing surface layout — keep section chrome on one scale. */
export const LANDING_SHELL = 'mx-auto max-w-7xl px-margin-mobile sm:px-8 lg:px-margin-desktop'

export const LANDING_SECTION_Y = 'py-[clamp(4rem,10vw,7.5rem)]'

export const LANDING_HEADING =
  'font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-balance'

/** Primary ink CTA — brand color lives in photography, not chrome.
 *  Pair on-surface fill with background ink so dark/light both contrast. */
export const LANDING_CTA_PRIMARY = 'min-h-11 bg-on-surface text-background hover:bg-on-surface/90'

/** Ghost CTA on solid page sections (not over photography). */
export const LANDING_CTA_GHOST =
  'min-h-11 border-hairline-strong/60 bg-transparent text-on-surface hover:bg-surface-container'

/** Ghost CTA over dark media — always light ink for contrast in both themes. */
export const LANDING_CTA_GHOST_ON_MEDIA =
  'min-h-11 border-white/35 bg-transparent text-white hover:bg-white/10'

export const LANDING_FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink'

export const LANDING_FOCUS_RING_ON_MEDIA =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
