import { useBlocker } from '@tanstack/react-router'

export function useUnsavedChangesGuard(isDirty: boolean, confirmMessage: string) {
  useBlocker({
    shouldBlockFn: () => {
      if (!isDirty) {
        return false
      }

      return !window.confirm(confirmMessage)
    },
    enableBeforeUnload: isDirty,
  })
}
