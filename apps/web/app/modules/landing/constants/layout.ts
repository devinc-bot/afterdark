export const LANDING_SECTION_Y = 'py-[clamp(4rem,10vw,7.5rem)]'

export const LANDING_HEADING =
  'font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-balance'

/** Primary citrus CTA — theme-agnostic; light/dark share the same primary tokens. */
export const LANDING_CTA_PRIMARY =
  'min-h-11 rounded-app bg-primary text-on-primary shadow-sm hover:bg-primary/90'

/** Ghost CTA on solid page sections (not over photography). */
export const LANDING_CTA_GHOST =
  'min-h-11 rounded-app border-hairline-strong/60 bg-transparent text-on-surface hover:bg-surface-container'

/**
 * Secondary CTA on editorial hero (surface scrims, on-surface ink — not white-on-media).
 * Landing-scoped; keep GHOST_ON_MEDIA for true dark photography overlays elsewhere.
 */
export const LANDING_CTA_HERO_SECONDARY =
  'min-h-11 rounded-app border border-outline-variant/60 bg-surface-container-high/60 text-on-surface backdrop-blur-md hover:bg-surface-container-highest/80'

/** Outline citrus CTA — border + label in primary. */
export const LANDING_CTA_OUTLINE_PRIMARY =
  'min-h-11 rounded-app border border-primary bg-primary/5 text-primary hover:bg-primary hover:text-on-primary'

/** Ghost CTA over dark media — always light ink for contrast in both themes. */
export const LANDING_CTA_GHOST_ON_MEDIA =
  'min-h-11 border-white/35 bg-transparent text-white hover:bg-white/10'

export const LANDING_FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink'

export const LANDING_FOCUS_RING_ON_MEDIA =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
