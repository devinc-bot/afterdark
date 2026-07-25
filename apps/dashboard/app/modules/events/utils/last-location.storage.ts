const LAST_LOCATION_KEY = 'repo:events:last-location:v1'

export function readLastEventLocationId(): string | null {
  try {
    return localStorage.getItem(LAST_LOCATION_KEY)
  } catch {
    return null
  }
}

export function saveLastEventLocationId(locationId: string): void {
  if (!locationId) return
  try {
    localStorage.setItem(LAST_LOCATION_KEY, locationId)
  } catch {
    // Storage can throw in private mode, when quota is exceeded, or when disabled.
  }
}
