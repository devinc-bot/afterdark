import { VIEW_TRANSITION_TYPE } from './names'
import { prefersReducedMotion } from './motion'

type LocationChangeInfo = {
  pathChanged: boolean
}

/**
 * Soft route morphs on path changes only (skips search/hash updates + reduced motion).
 * Pass as `defaultViewTransition` to `createRouter`.
 */
export const defaultViewTransitionOptions = {
  types: ({ pathChanged }: LocationChangeInfo): string[] | false => {
    if (!pathChanged || prefersReducedMotion()) return false
    return [VIEW_TRANSITION_TYPE.routeChange]
  },
}
