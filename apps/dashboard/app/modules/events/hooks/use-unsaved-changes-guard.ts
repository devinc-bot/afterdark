import { useCallback, useEffect, useRef, useState } from 'react'

type UseUnsavedChangesGuardProps = {
  isDirty: boolean
  defaultLeaveAction: () => void
}

export function useUnsavedChangesGuard({
  isDirty,
  defaultLeaveAction,
}: UseUnsavedChangesGuardProps) {
  const [unsavedOpen, setUnsavedOpen] = useState(false)
  const leaveActionRef = useRef(defaultLeaveAction)

  useEffect(() => {
    leaveActionRef.current = defaultLeaveAction
  }, [defaultLeaveAction])

  useEffect(() => {
    if (!isDirty) return

    const handleBeforeUnload = (browserEvent: BeforeUnloadEvent) => {
      browserEvent.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const requestLeave = useCallback(
    (action: () => void) => {
      leaveActionRef.current = action
      if (isDirty) {
        setUnsavedOpen(true)
        return
      }
      action()
    },
    [isDirty]
  )

  const confirmLeave = useCallback(() => {
    leaveActionRef.current()
  }, [])

  return { unsavedOpen, setUnsavedOpen, requestLeave, confirmLeave }
}
