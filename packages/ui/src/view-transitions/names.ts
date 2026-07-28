/**
 * Named View Transition snapshots shared by the apps (web + dashboard).
 * Add a key here first, then wire `vtStyle` / `armViewTransition` + optional CSS
 * in `styles.css`.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
 */
export const VT = {
  /** Persistent chrome (header / breadcrumb bar) — morphs to itself across routes. */
  siteHeader: 'site-header',
  /** Primary page body — soft settle on path changes. */
  mainContent: 'main-content',
  /** Shared media morph: discover list/coverflow → event detail hero (web). */
  eventHero: 'event-hero',
} as const

export type ViewTransitionName = (typeof VT)[keyof typeof VT]

/** Types passed to `document.startViewTransition({ types })` via TanStack Router. */
export const VIEW_TRANSITION_TYPE = {
  routeChange: 'route-change',
} as const

export type ViewTransitionType = (typeof VIEW_TRANSITION_TYPE)[keyof typeof VIEW_TRANSITION_TYPE]

/** DOM marker for the element that should receive a temporary name on navigate. */
export const VT_SOURCE_ATTR = 'data-vt-source' as const

/** DOM marker for a scope that contains a `data-vt-source` (e.g. card with overlay link). */
export const VT_SCOPE_ATTR = 'data-vt-scope' as const
