import type { CSSProperties } from 'react'
import type { ViewTransitionName } from './names'

/** Persistent `view-transition-name` for destination (or always-on) snapshots. */
export function vtStyle(name: ViewTransitionName): Pick<CSSProperties, 'viewTransitionName'> {
  return { viewTransitionName: name }
}
