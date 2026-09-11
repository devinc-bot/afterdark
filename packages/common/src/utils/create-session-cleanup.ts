export type CreateSessionCleanupOptions = {
  clearAuthSession: () => void
}

export function createSessionCleanup(options: CreateSessionCleanupOptions) {
  let clearSessionState: (() => void) | null = null

  function registerSessionStateCleanup(cleanup: () => void): void {
    clearSessionState = cleanup
  }

  function clearLocalSession(): void {
    options.clearAuthSession()
    clearSessionState?.()
  }

  return {
    registerSessionStateCleanup,
    clearLocalSession,
  }
}
