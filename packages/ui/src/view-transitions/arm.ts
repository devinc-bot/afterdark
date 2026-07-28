import { VT, VT_SCOPE_ATTR, VT_SOURCE_ATTR, type ViewTransitionName } from './names'
import { prefersReducedMotion } from './motion'

function findVtSource(root: Element, name: ViewTransitionName): HTMLElement | null {
  if (root instanceof HTMLElement && root.getAttribute(VT_SOURCE_ATTR) === name) {
    return root
  }

  const nested = root.querySelector(`[${VT_SOURCE_ATTR}="${CSS.escape(name)}"]`)
  if (nested instanceof HTMLElement) return nested

  const scope = root.closest(`[${VT_SCOPE_ATTR}="${CSS.escape(name)}"]`)
  const fromScope = scope?.querySelector(`[${VT_SOURCE_ATTR}="${CSS.escape(name)}"]`)
  if (fromScope instanceof HTMLElement) return fromScope

  return null
}

/**
 * Temporarily assigns a named snapshot on the nearest `[data-vt-source]` so the
 * upcoming path navigation can morph into a matching `vtStyle(name)` destination.
 */
export function armViewTransition(
  event: Pick<Event, 'currentTarget'>,
  name: ViewTransitionName
): void {
  if (prefersReducedMotion()) return

  const root = event.currentTarget
  if (!(root instanceof Element)) return

  const source = findVtSource(root, name)
  if (!source) return

  source.style.viewTransitionName = name
}

/** Pre-bound arm for discover → event detail media morph (web). */
export function armEventHero(event: Pick<Event, 'currentTarget'>): void {
  armViewTransition(event, VT.eventHero)
}
